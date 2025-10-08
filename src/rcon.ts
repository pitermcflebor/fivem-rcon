import * as dgram from 'dgram';
import * as vscode from 'vscode';

export interface RconConfig {
    host: string;
    port: number;
    password: string;
}

// Protocolo Quake 3 (usado por FiveM RCON)
// Basado en: https://github.com/icedream/icecon
const OOB_HEADER = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]); // Out-Of-Band message header

export class RconClient {
    private socket: dgram.Socket | null = null;
    private config: RconConfig;
    private logger: vscode.OutputChannel;
    private connected: boolean = false;

    constructor(config: RconConfig, logger: vscode.OutputChannel) {
        this.config = config;
        this.logger = logger;
    }

    private log(message: string): void {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
        this.logger.appendLine(`[${timestamp}] ${message}`);
    }

    /**
     * Construye un mensaje según el protocolo Quake 3
     * Formato: [OOB Header (4 bytes)][command name][space][data][null terminator]
     */
    private buildQ3Message(name: string, data: string): Buffer {
        const parts: Buffer[] = [
            OOB_HEADER,                        // 0xFF 0xFF 0xFF 0xFF
            Buffer.from(name, 'utf8'),          // command name (e.g., "rcon")
            Buffer.from(' ', 'utf8'),           // space separator
            Buffer.from(data, 'utf8'),          // data (e.g., "password command")
            Buffer.from([0x00])                 // null terminator
        ];
        
        return Buffer.concat(parts);
    }

    /**
     * Parsea un mensaje recibido según el protocolo Quake 3
     */
    private parseQ3Message(buffer: Buffer): { name: string; data: string } | null {
        // Verificar header OOB
        if (buffer.length < 4 || !buffer.slice(0, 4).equals(OOB_HEADER)) {
            return null;
        }

        // El resto del mensaje después del header
        const content = buffer.slice(4);
        
        // Buscar el primer espacio, tab, newline o null
        let splitPos = -1;
        for (let i = 0; i < content.length; i++) {
            const byte = content[i];
            if (byte === 0x20 || byte === 0x09 || byte === 0x0A || byte === 0x0D || byte === 0x00) {
                splitPos = i;
                break;
            }
        }

        if (splitPos === -1) {
            // No hay separador, todo es el nombre del comando
            return {
                name: content.toString('utf8'),
                data: ''
            };
        }

        const name = content.slice(0, splitPos).toString('utf8');
        const data = content.slice(splitPos + 1).toString('utf8').replace(/\0+$/, ''); // Remover nulls finales

        return { name, data };
    }

    /**
     * Conecta al servidor RCON
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.log(`Connecting to ${this.config.host}:${this.config.port} (Quake 3 Protocol)`);
            
            // Crear socket UDP
            this.socket = dgram.createSocket('udp4');

            // Variable para evitar resolver/rechazar múltiples veces
            let settled = false;
            let packetsReceived = 0;
            
            // Configurar timeout
            const timeout = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    this.log('');
                    this.log('✗ TIMEOUT: Server did not respond in 5 seconds');
                    this.log(`  Packets received: ${packetsReceived}`);
                    this.log('');
                    this.log('TROUBLESHOOTING:');
                    this.log('  1. Is FiveM server running?');
                    this.log('  2. Is RCON enabled in server.cfg? (rcon_password "...")');
                    this.log('  3. Is the password correct?');
                    this.log('  4. Is firewall blocking UDP?');
                    this.disconnect();
                    reject(new Error('Connection timeout'));
                }
            }, 5000);

            // Manejar errores del socket
            this.socket.on('error', (err) => {
                this.log(`✗ Socket error: ${err.message}`);
                if (!settled) {
                    settled = true;
                    clearTimeout(timeout);
                    reject(err);
                }
            });

            // Manejar eventos de listening
            this.socket.on('listening', () => {
                const address = this.socket!.address();
                this.log(`✓ Socket listening on ${address.address}:${address.port}`);
            });

            // Manejar mensajes recibidos
            this.socket.on('message', (msg, rinfo) => {
                packetsReceived++;
                this.log(`← Packet #${packetsReceived} from ${rinfo.address}:${rinfo.port} (${msg.length} bytes)`);
                
                const parsed = this.parseQ3Message(msg);
                
                if (parsed) {
                    if (parsed.name.toLowerCase() === 'print') {
                        if (!settled) {
                            // Primera respuesta = conexión exitosa
                            settled = true;
                            clearTimeout(timeout);
                            this.connected = true;
                            this.log('✓ CONNECTED SUCCESSFULLY');
                            resolve();
                        }
                    }
                } else {
                    this.log('  ⚠ Could not parse message');
                }
            });

            // Bind y enviar mensaje de autenticación
            this.socket.bind(() => {
                const address = this.socket!.address();
                this.log(`✓ Socket bound to ${address.address}:${address.port}`);
                
                // Construir mensaje: rcon <password> <command>
                const authMsg = this.buildQ3Message('rcon', `${this.config.password} `);
                
                this.log(`→ Sending auth packet to ${this.config.host}:${this.config.port} (${authMsg.length} bytes)`);
                
                this.socket!.send(authMsg, this.config.port, this.config.host, (err, bytes) => {
                    if (err) {
                        this.log(`✗ Send error: ${err.message}`);
                        if (!settled) {
                            settled = true;
                            clearTimeout(timeout);
                            reject(err);
                        }
                    } else {
                        this.log(`✓ Packet sent (${bytes} bytes), waiting for response...`);
                    }
                });
            });
        });
    }

    /**
     * Envía un comando al servidor
     */
    async sendCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.connected) {
                reject(new Error('Not connected to server'));
                return;
            }

            this.log(`→ Command: ${command}`);

            let responseData = '';
            let settled = false;

            // Timeout de 10 segundos
            const timeout = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    this.socket!.removeAllListeners('message');
                    
                    if (responseData) {
                        resolve(responseData);
                    } else {
                        reject(new Error('Timeout waiting for response'));
                    }
                }
            }, 10000);

            // Manejar respuestas
            const onMessage = (msg: Buffer) => {
                const parsed = this.parseQ3Message(msg);
                
                if (parsed && parsed.name.toLowerCase() === 'print') {
                    responseData += parsed.data;
                    
                    // Dar un poco de tiempo para respuestas múltiples
                    clearTimeout(timeout);
                    setTimeout(() => {
                        if (!settled) {
                            settled = true;
                            this.socket!.removeListener('message', onMessage);
                            this.log(`✓ Response received`);
                            resolve(responseData);
                        }
                    }, 200);
                }
            };

            this.socket.on('message', onMessage);

            // Construir y enviar mensaje: rcon <password> <command>
            const cmdMsg = this.buildQ3Message('rcon', `${this.config.password} ${command}`);
            
            this.socket.send(cmdMsg, this.config.port, this.config.host, (err) => {
                if (err) {
                    this.log(`✗ Send error: ${err.message}`);
                    if (!settled) {
                        settled = true;
                        clearTimeout(timeout);
                        this.socket!.removeListener('message', onMessage);
                        reject(err);
                    }
                }
            });
        });
    }

    /**
     * Cierra la conexión
     */
    disconnect(): void {
        if (this.socket) {
            this.log('Disconnecting...');
            this.socket.close();
            this.socket = null;
            this.connected = false;
        }
    }

    /**
     * Verifica si está conectado
     */
    isConnected(): boolean {
        return this.connected;
    }
}
