# FiveM RCON Extension for VS Code# FiveM RCON Extension para VS Code



**[Español](./README.es.md)** | EnglishExtensión de Visual Studio Code para conectarse a servidores **FiveM** usando el protocolo RCON (Remote Console). Implementa el **protocolo Quake 3** que usa FiveM, basado en el proyecto exitoso [IceCon](https://github.com/icedream/icecon).



Visual Studio Code extension to connect to **FiveM** servers using the RCON (Remote Console) protocol. Implements the **Quake 3 protocol** used by FiveM, based on the successful [IceCon](https://github.com/icedream/icecon) project.## 🎯 Características



## 🎯 Features- ✅ Conexión a servidores FiveM vía protocolo Quake 3 (UDP)

- ✅ Autenticación segura con contraseña (almacenada en VS Code Secrets)

- ✅ Connect to FiveM servers via Quake 3 protocol (UDP)- ✅ Envío de comandos RCON desde la paleta de comandos

- ✅ Secure password authentication (stored in VS Code Secrets)- ✅ Reinicio rápido de recursos con clic derecho en `fxmanifest.lua`

- ✅ Send RCON commands from the command palette- ✅ Visualización de respuestas en el Output Channel

- ✅ Quick resource restart with right-click on `fxmanifest.lua`- ✅ Gestión de conexiones (conectar/desconectar)

- ✅ Response visualization in Output Channel- ✅ **Soporte multiidioma** (inglés y español)

- ✅ Connection management (connect/disconnect)- ✅ Implementación basada en [IceCon](https://github.com/icedream/icecon) (proyecto probado y funcional)

- ✅ **Multi-language support** (English and Spanish)

- ✅ Implementation based on [IceCon](https://github.com/icedream/icecon) (proven and functional project)## 📋 Requisitos



## 📋 Requirements- Visual Studio Code 1.104.0 o superior

- Servidor FiveM con RCON habilitado

- Visual Studio Code 1.104.0 or higher

- FiveM server with RCON enabled## 🚀 Instalación



## 🚀 Installation1. Clona este repositorio

2. Ejecuta `npm install`

### From VS Code Marketplace (Recommended)3. Presiona F5 para abrir una ventana de desarrollo con la extensión cargada



1. Open VS Code## ⚙️ Configuración del Servidor FiveM

2. Go to Extensions (`Ctrl+Shift+X`)

3. Search for "FiveM RCON"Para que RCON funcione, tu servidor FiveM debe tener la siguiente configuración en `server.cfg`:

4. Click Install

```cfg

### From Source# Habilitar RCON

rcon_password "tu_contraseña_segura"

1. Clone this repository

2. Run `npm install`# Puerto del servidor (por defecto 30120)

3. Press F5 to open a development window with the extension loadedendpoint_add_udp "0.0.0.0:30120"

```

## ⚙️ FiveM Server Configuration

Después de editar `server.cfg`, reinicia completamente el servidor FiveM.

For RCON to work, your FiveM server must have the following configuration in `server.cfg`:

## 📖 Uso

```cfg

# Enable RCON### 1. Configurar la Conexión

rcon_password "your_secure_password"

Presiona `Ctrl+Shift+P` y ejecuta:

# Server port (default 30120)```

endpoint_add_udp "0.0.0.0:30120"RCON: Configurar Conexión

``````



After editing `server.cfg`, completely restart the FiveM server.Ingresa:

- **Dirección del servidor**: `127.0.0.1:30120` (o la IP:Puerto de tu servidor)

## 📖 Usage- **Contraseña RCON**: La contraseña configurada en `server.cfg`



### 1. Configure Connection### 2. Conectar al Servidor



Press `Ctrl+Shift+P` and run:```

```RCON: Conectar al Servidor

FiveM: Configure Connection```

```

Verás una notificación cuando la conexión sea exitosa. Los logs detallados aparecen en el Output Channel "FiveM RCON".

Enter:

- **Server address**: `127.0.0.1:30120` (or your server's IP:Port)### 3. Enviar Comandos

- **RCON password**: The password configured in `server.cfg`

```

### 2. Connect to ServerRCON: Enviar Comando

```

```

FiveM: Connect to ServerEjemplos de comandos:

```- `status` - Lista de jugadores conectados

- `cmdlist` - Lista de comandos disponibles

You'll see a notification when the connection is successful. Detailed logs appear in the "FiveM RCON" Output Channel.- `restart <resource>` - Reinicia un recurso

- `stop <resource>` - Detiene un recurso

### 3. Send Commands- `start <resource>` - Inicia un recurso



```### 4. Reiniciar un Recurso (Atajo Rápido)

FiveM: Send Command

```**Forma rápida**: Haz **clic derecho** sobre el archivo `fxmanifest.lua` de cualquier recurso y selecciona **"Reiniciar recurso"**.



Command examples:La extensión:

- `status` - List of connected players1. Verificará que hay una conexión RCON activa (te pedirá conectar si no lo estás)

- `cmdlist` - List of available commands2. Obtendrá automáticamente el nombre de la carpeta del recurso

- `restart <resource>` - Restart a resource3. Ejecutará `ensure <nombre_carpeta>` en el servidor

- `stop <resource>` - Stop a resource4. Mostrará la respuesta en el Output Channel

- `start <resource>` - Start a resource

- `ensure <resource>` - Restart or start a resource### 5. Desconectar



### 4. Restart a Resource (Quick Method)```

RCON: Desconectar del Servidor

**Two ways to restart resources:**```



#### Method 1: Context Menu## 🔧 Protocolo Técnico

**Right-click** on any `fxmanifest.lua` file and select **"Restart Resource"**.

Esta extensión implementa el **protocolo Quake 3** (Q3-compatible RCON) que usa FiveM:

The extension will:

1. Check for an active RCON connection (ask to connect if not connected)### Formato de Mensaje

2. Automatically get the resource folder name```

3. Execute `ensure <folder_name>` on the server[Header OOB (4 bytes)][command name][space][data][null terminator]

4. Show the response in the Output Channel```



#### Method 2: Command Palette- **Header OOB**: `0xFF 0xFF 0xFF 0xFF` (Out-Of-Band message)

1. Press `Ctrl+Shift+P`- **Command Name**: `"rcon"`

2. Run `FiveM: Restart Resource`- **Data**: `"<password> <command>"`

3. Enter the resource name when prompted

4. The resource will be restarted### Ejemplo de Paquete

Para el comando `status` con contraseña `123`:

### 5. Disconnect```

FF FF FF FF 72 63 6F 6E 20 31 32 33 20 73 74 61 74 75 73 00

```│           │              │         │                    │

FiveM: Disconnect│           │              │         │                    └─ Null terminator

```│           │              │         └─ Command: "status"

│           │              └─ Password: "123"

## 🔧 Technical Protocol│           └─ Command name: "rcon"

└─ OOB Header

This extension implements the **Quake 3 protocol** (Q3-compatible RCON) used by FiveM:```



### Message Format### Respuestas del Servidor

```

[OOB Header (4 bytes)][command name][space][data][null terminator]El servidor responde con mensajes que también usan el header OOB:

``````

FF FF FF FF 70 72 69 6E 74 20 [datos...]

- **OOB Header**: `0xFF 0xFF 0xFF 0xFF` (Out-Of-Band message)│           │                 │

- **Command Name**: `"rcon"`│           │                 └─ Respuesta del comando

- **Data**: `"<password> <command>"`│           └─ Command name: "print"

└─ OOB Header

### Packet Example```

For the `status` command with password `123`:

```## 🙏 Créditos

FF FF FF FF 72 63 6F 6E 20 31 32 33 20 73 74 61 74 75 73 00

│           │              │         │                    │Esta implementación está basada en:

│           │              │         │                    └─ Null terminator- [IceCon](https://github.com/icedream/icecon) - Cliente RCON Q3-compatible por Icedream

│           │              │         └─ Command: "status"- [go-q3net](https://github.com/icedream/go-q3net) - Librería del protocolo Quake 3

│           │              └─ Password: "123"

│           └─ Command name: "rcon"## 🐛 Solución de Problemas

└─ OOB Header

```### Error: "Timeout de conexión"



### Server Responses**Causas posibles:**

1. El servidor FiveM no está ejecutándose

The server responds with messages that also use the OOB header:2. RCON no está habilitado en `server.cfg`

```3. Puerto incorrecto

FF FF FF FF 70 72 69 6E 74 20 [data...]4. Firewall bloqueando UDP

│           │                 │

│           │                 └─ Command response**Soluciones:**

│           └─ Command name: "print"```bash

└─ OOB Header# 1. Verificar que el servidor esté escuchando

```netstat -an | findstr :30120



## 🙏 Credits# 2. Verificar server.cfg

cat resources/[local]/server/server.cfg | grep rcon

This implementation is based on:

- [IceCon](https://github.com/icedream/icecon) - Q3-compatible RCON client by Icedream# 3. Probar conectividad

- [go-q3net](https://github.com/icedream/go-q3net) - Quake 3 protocol libraryTest-NetConnection -ComputerName 127.0.0.1 -Port 30120

```

## 🐛 Troubleshooting

### Error: "No está conectado al servidor"

### Error: "Connection timeout"

Primero ejecuta el comando "RCON: Conectar al Servidor" antes de enviar comandos.

**Possible causes:**

1. FiveM server is not running### La contraseña no funciona

2. RCON is not enabled in `server.cfg`

3. Incorrect portVerifica que la contraseña en `server.cfg` coincida exactamente (sin espacios extra):

4. Firewall blocking UDP```cfg

rcon_password "mi_contraseña"

**Solutions:**```

```bash

# 1. Verify server is listening## 📝 Comandos Disponibles

netstat -an | findstr :30120

| Comando | Descripción |

# 2. Verify server.cfg|---------|-------------|

cat server.cfg | grep rcon| `RCON: Configurar Conexión` | Configura IP:Puerto y contraseña |

| `RCON: Conectar al Servidor` | Establece conexión RCON |

# 3. Test connectivity (PowerShell)| `RCON: Enviar Comando` | Envía un comando al servidor |

Test-NetConnection -ComputerName 127.0.0.1 -Port 30120| `RCON: Desconectar` | Cierra la conexión |

```| `Reiniciar recurso` | Menú contextual en fxmanifest.lua para reiniciar el recurso |



### Error: "Not connected to server"## 🌐 Internacionalización



First run the "FiveM: Connect to Server" command before sending commands.La extensión soporta múltiples idiomas y detecta automáticamente el idioma de VS Code.



### Password not working**Idiomas soportados:**

- 🇺🇸 **Inglés** (English) - Idioma por defecto

Verify that the password in `server.cfg` matches exactly (no extra spaces):- 🇪🇸 **Español** (Spanish)

```cfg

rcon_password "my_password"Los mensajes de usuario se mostrarán en el idioma de tu VS Code. Los logs técnicos se mantienen en inglés para facilitar el debugging.

```

**Para agregar un nuevo idioma**, consulta el archivo [`INTERNATIONALIZATION.md`](./INTERNATIONALIZATION.md).

## 📝 Available Commands

## 📄 Licencia

| Command | Description |

|---------|-------------|Este proyecto es código abierto. Ver la licencia del proyecto base [IceCon](https://github.com/icedream/icecon/blob/main/COPYING) (GPL-2.0).

| `FiveM: Configure Connection` | Configure IP:Port and password |

| `FiveM: Connect to Server` | Establish RCON connection |## 🤝 Contribuir

| `FiveM: Send Command` | Send a command to the server |

| `FiveM: Restart Resource` | Restart a resource (from palette or context menu) |¿Encontraste un bug? ¿Tienes una sugerencia? Abre un issue o pull request.

| `FiveM: Disconnect` | Close the connection |
| `FiveM: Test UDP Connectivity` | Test UDP connection to server |

## 🌐 Internationalization

The extension supports multiple languages and automatically detects your VS Code language.

**Supported languages:**
- 🇺🇸 **English** - Default language
- 🇪🇸 **Spanish** (Español)

User messages will be displayed in your VS Code language. Technical logs are kept in English to facilitate debugging.

**To add a new language**, see the [`INTERNATIONALIZATION.md`](./INTERNATIONALIZATION.md) file.

## 📄 License

This project is open source. See the base project license [IceCon](https://github.com/icedream/icecon/blob/main/COPYING) (GPL-2.0).

## 🤝 Contributing

Found a bug? Have a suggestion? Open an issue or pull request.

---

Made with ❤️ for the FiveM community
