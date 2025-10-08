import * as vscode from 'vscode';
import { RconClient, RconConfig } from './rcon';
import { loadTranslations, t } from './i18n';

let rconClient: RconClient | null = null;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
	console.log('Extensión "fivem-rcon" activada');

	// Load translations
	loadTranslations(context.extensionPath);

	// Crear canal de salida para logs
	outputChannel = vscode.window.createOutputChannel('FiveM RCON');
	outputChannel.appendLine(t('log.extensionStarted'));
	outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
	outputChannel.appendLine('');

	// Comando para configurar la conexión RCON
	const configureRcon = vscode.commands.registerCommand('fivem-rcon.configure', async () => {
		try {
			// Solicitar IP:PUERTO del servidor
			const serverAddress = await vscode.window.showInputBox({
				prompt: t('configure.prompt.serverAddress'),
				placeHolder: t('configure.placeholder.serverAddress'),
				validateInput: (value) => {
					const pattern = /^[\w\.-]+:\d+$/;
					if (!value || !pattern.test(value)) {
						return t('configure.validation.invalidFormat');
					}
					return null;
				}
			});

			if (!serverAddress) {
				return;
			}

			// Solicitar contraseña
			const password = await vscode.window.showInputBox({
				prompt: t('configure.prompt.password'),
				password: true,
				placeHolder: t('configure.placeholder.password')
			});

			if (!password) {
				return;
			}

			// Guardar configuración de forma segura
			const [host, portStr] = serverAddress.split(':');
			const port = parseInt(portStr, 10);

			// Guardar en workspace state
			await context.workspaceState.update('rcon.host', host);
			await context.workspaceState.update('rcon.port', port);
			
			// Guardar contraseña en secrets (más seguro)
			await context.secrets.store('rcon.password', password);

			vscode.window.showInformationMessage(t('configure.success'));
		} catch (error) {
			vscode.window.showErrorMessage(t('configure.error', error));
		}
	});

	// Comando para conectar al servidor RCON
	const connectRcon = vscode.commands.registerCommand('fivem-rcon.connect', async () => {
		try {
			// Mostrar y limpiar el canal de salida
			//outputChannel.show(true);
			outputChannel.appendLine('');
			outputChannel.appendLine(t('log.connectingToRcon'));
			outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);

			// Obtener configuración guardada
			const host = context.workspaceState.get<string>('rcon.host');
			const port = context.workspaceState.get<number>('rcon.port');
			const password = await context.secrets.get('rcon.password');

			outputChannel.appendLine(`Host: ${host}:${port}`);
			outputChannel.appendLine(`Password Length: ${password?.length || 0}`);

			if (!host || !port || !password) {
				vscode.window.showWarningMessage(t('connect.warning.noConfig'));
				outputChannel.appendLine(t('log.errorConfig'));
				return;
			}

			const config: RconConfig = { host, port, password };
			rconClient = new RconClient(config, outputChannel);

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: t('connect.progress'),
				cancellable: false
			}, async () => {
				await rconClient!.connect();
			});

			outputChannel.appendLine('✓ Connection successful');
			vscode.window.showInformationMessage(t('connect.success', host, port));
		} catch (error) {
			outputChannel.appendLine(t('log.error', error));
			vscode.window.showErrorMessage(t('connect.error'), t('connect.error.viewLog')).then(selection => {
				if (selection === t('connect.error.viewLog')) {
					outputChannel.show();
				}
			});
			rconClient = null;
		}
	});

	// Comando para desconectar del servidor RCON
	const disconnectRcon = vscode.commands.registerCommand('fivem-rcon.disconnect', () => {
		if (rconClient) {
			rconClient.disconnect();
			rconClient = null;
			outputChannel.appendLine('');
			outputChannel.appendLine(t('log.disconnected'));
			vscode.window.showInformationMessage(t('disconnect.success'));
		} else {
			vscode.window.showWarningMessage(t('disconnect.warning.noConnection'));
		}
	});

	// Comando para probar conectividad UDP
	const testUdpConnection = vscode.commands.registerCommand('fivem-rcon.testUdp', async () => {
		try {
			outputChannel.show(true);
			outputChannel.appendLine('');
			outputChannel.appendLine(t('log.testingUdp'));
			outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);

			const host = context.workspaceState.get<string>('rcon.host') || '127.0.0.1';
			const port = context.workspaceState.get<number>('rcon.port') || 30120;

			outputChannel.appendLine(`Testing UDP connectivity to ${host}:${port}`);
			outputChannel.appendLine('');

			const dgram = require('dgram');
			const testSocket = dgram.createSocket('udp4');

			testSocket.on('listening', () => {
				const addr = testSocket.address();
				outputChannel.appendLine(`✓ UDP socket created and listening on ${addr.address}:${addr.port}`);
			});

			testSocket.on('error', (err: Error) => {
				outputChannel.appendLine(`✗ Error: ${err.message}`);
				testSocket.close();
			});

			testSocket.on('message', (msg: Buffer, rinfo: any) => {
				outputChannel.appendLine(`✓ RESPONSE RECEIVED from ${rinfo.address}:${rinfo.port}`);
				outputChannel.appendLine(`  Content: ${msg.toString('utf8')}`);
				outputChannel.appendLine(`  Hex: ${msg.toString('hex')}`);
				testSocket.close();
				vscode.window.showInformationMessage(t('testUdp.success'));
			});

			testSocket.bind(() => {
				const testMsg = 'test_ping';
				const testBuffer = Buffer.from(testMsg);
				
				outputChannel.appendLine(t('testUdp.sending', testMsg));
				
				testSocket.send(testBuffer, 0, testBuffer.length, port, host, (err: Error | null) => {
					if (err) {
						outputChannel.appendLine(`✗ Send error: ${err.message}`);
						testSocket.close();
					} else {
						outputChannel.appendLine(`✓ Message sent, waiting for response...`);
					}
				});

				setTimeout(() => {
					outputChannel.appendLine('');
					outputChannel.appendLine(t('testUdp.timeout'));
					outputChannel.appendLine(t('testUdp.timeoutNote'));
					testSocket.close();
				}, 5000);
			});

		} catch (error) {
			outputChannel.appendLine(t('testUdp.error', error));
			vscode.window.showErrorMessage(t('testUdp.error', error));
		}
	});

	// Comando para enviar un comando RCON
	const sendCommand = vscode.commands.registerCommand('fivem-rcon.sendCommand', async () => {
		if (!rconClient || !rconClient.isConnected()) {
			vscode.window.showWarningMessage(t('sendCommand.warning.notConnected'));
			return;
		}

		const command = await vscode.window.showInputBox({
			prompt: t('sendCommand.prompt'),
			placeHolder: t('sendCommand.placeholder')
		});

		if (!command) {
			return;
		}

		try {
			const response = await rconClient.sendCommand(command);
			
			// Mostrar respuesta en un nuevo documento
			const doc = await vscode.workspace.openTextDocument({
				content: t('sendCommand.resultTitle', command, response),
				language: 'text'
			});
			await vscode.window.showTextDocument(doc);
		} catch (error) {
			vscode.window.showErrorMessage(t('sendCommand.error', error));
		}
	});

	// Comando para reiniciar un recurso de FiveM
	const restartResource = vscode.commands.registerCommand('fivem-rcon.restartResource', async (uri?: vscode.Uri) => {
		try {
			// Verificar que hay una conexión RCON activa
			if (!rconClient || !rconClient.isConnected()) {
				const shouldConnect = await vscode.window.showWarningMessage(
					t('restartResource.warning.noConnection'),
					t('restartResource.button.connect'),
					t('restartResource.button.cancel')
				);
				
				if (shouldConnect === t('restartResource.button.connect')) {
					await vscode.commands.executeCommand('fivem-rcon.connect');
					// Verificar si la conexión fue exitosa
					if (!rconClient || !rconClient.isConnected()) {
						return;
					}
				} else {
					return;
				}
			}

			let resourceFolder: string;

			// Detectar si viene del menú contextual (tiene uri) o de la paleta de comandos (no tiene uri)
			if (uri) {
				// Viene del menú contextual - obtener nombre de la carpeta
				const filePath = uri.fsPath;
				const path = require('path');
				resourceFolder = path.basename(path.dirname(filePath));
			} else {
				// Viene de la paleta de comandos - preguntar por el nombre
				const input = await vscode.window.showInputBox({
					prompt: t('restartResource.prompt.resourceName'),
					placeHolder: t('restartResource.placeholder.resourceName')
				});

				if (!input) {
					return;
				}

				resourceFolder = input.trim();
			}

			outputChannel.appendLine('');
			outputChannel.appendLine(t('log.restartingResource', resourceFolder));
			//outputChannel.show(true);

			// Ejecutar comando ensure
			const command = `ensure ${resourceFolder}`;
			outputChannel.appendLine(t('log.executingCommand', command));

			const response = await rconClient.sendCommand(command);
			
			outputChannel.appendLine(t('log.serverResponse'));
			outputChannel.appendLine(response);
			outputChannel.appendLine(t('log.commandCompleted'));

			vscode.window.showInformationMessage(t('restartResource.success', resourceFolder));
		} catch (error) {
			outputChannel.appendLine(t('log.error', error));
			vscode.window.showErrorMessage(t('restartResource.error', error));
		}
	});

	context.subscriptions.push(configureRcon, connectRcon, disconnectRcon, sendCommand, testUdpConnection, restartResource);
}

export function deactivate() {
	if (rconClient) {
		rconClient.disconnect();
		rconClient = null;
	}
}
