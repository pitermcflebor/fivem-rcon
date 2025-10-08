# VS Code RCON Extension Project

## Descripción del Proyecto
Extensión de Visual Studio Code para conectarse a servidores RCON (Remote Console) de FiveM. Implementa el protocolo Quake 3 (Q3-compatible RCON over UDP) basándose en el proyecto exitoso [IceCon](https://github.com/icedream/icecon).

## Características
- ✅ Conexión a servidores RCON mediante IP:PUERTO
- ✅ Autenticación segura por contraseña usando VS Code Secrets API
- ✅ Comandos en la paleta de comandos para configurar conexión
- ✅ Envío de comandos RCON y visualización de respuestas
- ✅ Gestión de conexiones (conectar/desconectar)
- ✅ Protocolo Quake 3 (usado por FiveM)

## Arquitectura

### Archivos principales
- `src/extension.ts`: Punto de entrada, registra comandos y gestiona el ciclo de vida
- `src/rcon.ts`: Cliente RCON que implementa el protocolo Quake 3
- `package.json`: Manifiesto de la extensión con comandos y configuración

### Comandos disponibles
1. `fivem-rcon.configure`: Configura IP:PUERTO y contraseña
2. `fivem-rcon.connect`: Establece conexión con el servidor
3. `fivem-rcon.disconnect`: Cierra la conexión activa
4. `fivem-rcon.sendCommand`: Envía comandos al servidor

### Protocolo Quake 3 (FiveM RCON)
La extensión implementa el protocolo Quake 3 usado por FiveM:
- **Formato de mensaje**: `[OOB Header (4 bytes)][command name][space][data][null terminator]`
- **OOB Header**: `0xFF 0xFF 0xFF 0xFF` (Out-Of-Band message)
- **Para RCON**: 
  - Command name: `"rcon"`
  - Data: `"<password> <command>"`
- **Ejemplo**: `FF FF FF FF 72 63 6F 6E 20 31 32 33 20 73 74 61 74 75 73 00`
  - Header: `FF FF FF FF`
  - "rcon": `72 63 6F 6E`
  - " ": `20`
  - "123": `31 32 33`
  - " ": `20`
  - "status": `73 74 61 74 75 73`
  - Null: `00`

### Respuestas del servidor
- También usan OOB Header: `FF FF FF FF`
- Command name: `"print"`
- Data: La respuesta del comando

## Implementación basada en IceCon

Este proyecto se basa en [IceCon](https://github.com/icedream/icecon), un cliente RCON Q3-compatible probado y funcional escrito en Go. La implementación sigue el mismo patrón:

1. **Crear socket UDP** (`dgram.createSocket('udp4')`)
2. **Bind el socket** (puerto aleatorio local)
3. **Construir mensaje Q3**: `buildQ3Message('rcon', '<password> <command>')`
4. **Enviar a servidor**: `socket.send(buffer, port, host)`
5. **Recibir respuestas**: Parsear mensajes con `parseQ3Message()`

### Diferencias clave con implementación anterior
- ❌ **NO usar** formato "rcon <password>" simple (era incorrecto)
- ✅ **SÍ usar** protocolo Quake 3 con OOB header
- ❌ **NO usar** TCP/Source RCON (incompatible con FiveM)
- ✅ **SÍ usar** UDP con protocolo Q3

## Estado del Proyecto
- [x] Crear archivo copilot-instructions.md
- [x] Obtener información de configuración del proyecto
- [x] Crear estructura base de la extensión
- [x] Implementar lógica de RCON con protocolo Quake 3
- [x] Crear comandos de configuración
- [x] Instalar dependencias y compilar
- [x] Crear documentación README
- [x] Basar implementación en IceCon (exitoso)

## Desarrollo

### Compilar
```bash
npm run compile
```

### Modo watch
```bash
npm run watch
```

### Probar extensión
Presionar F5 en VS Code para abrir una ventana de desarrollo con la extensión cargada.

## Seguridad
- Las contraseñas se almacenan usando `context.secrets` (API segura de VS Code)
- Las credenciales no se guardan en texto plano
- Host y puerto se guardan en `context.workspaceState`

## Referencias
- [IceCon](https://github.com/icedream/icecon) - Cliente RCON Q3-compatible de referencia
- [go-q3net](https://github.com/icedream/go-q3net) - Librería del protocolo Quake 3
- [FiveM Docs](https://docs.fivem.net/) - Documentación oficial de FiveM
