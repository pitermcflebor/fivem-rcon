# FiveM RCON Extension para VS Code

Español | **[English](./README.md)**

Extensión de Visual Studio Code para conectarse a servidores **FiveM** usando el protocolo RCON (Remote Console). Implementa el **protocolo Quake 3** que usa FiveM, basado en el proyecto exitoso [IceCon](https://github.com/icedream/icecon).

## 🎯 Características

- ✅ Conexión a servidores FiveM vía protocolo Quake 3 (UDP)
- ✅ Autenticación segura con contraseña (almacenada en VS Code Secrets)
- ✅ Envío de comandos RCON desde la paleta de comandos
- ✅ Reinicio rápido de recursos con clic derecho en `fxmanifest.lua`
- ✅ Visualización de respuestas en el Output Channel
- ✅ Gestión de conexiones (conectar/desconectar)
- ✅ **Soporte multiidioma** (inglés y español)
- ✅ Implementación basada en [IceCon](https://github.com/icedream/icecon) (proyecto probado y funcional)

## 📋 Requisitos

- Visual Studio Code 1.104.0 o superior
- Servidor FiveM con RCON habilitado

## 🚀 Instalación

### Desde VS Code Marketplace (Recomendado)

1. Abre VS Code
2. Ve a Extensiones (`Ctrl+Shift+X`)
3. Busca "FiveM RCON"
4. Haz clic en Instalar

### Desde el código fuente

1. Clona este repositorio
2. Ejecuta `npm install`
3. Presiona F5 para abrir una ventana de desarrollo con la extensión cargada

## ⚙️ Configuración del Servidor FiveM

Para que RCON funcione, tu servidor FiveM debe tener la siguiente configuración en `server.cfg`:

```cfg
# Habilitar RCON
rcon_password "tu_contraseña_segura"

# Puerto del servidor (por defecto 30120)
endpoint_add_udp "0.0.0.0:30120"
```

Después de editar `server.cfg`, reinicia completamente el servidor FiveM.

## 📖 Uso

### 1. Configurar la Conexión

Presiona `Ctrl+Shift+P` y ejecuta:
```
RCON: Configurar Conexión
```

Ingresa:
- **Dirección del servidor**: `127.0.0.1:30120` (o la IP:Puerto de tu servidor)
- **Contraseña RCON**: La contraseña configurada en `server.cfg`

### 2. Conectar al Servidor

```
RCON: Conectar al Servidor
```

Verás una notificación cuando la conexión sea exitosa. Los logs detallados aparecen en el Output Channel "FiveM RCON".

### 3. Enviar Comandos

```
RCON: Enviar Comando
```

Ejemplos de comandos:
- `status` - Lista de jugadores conectados
- `cmdlist` - Lista de comandos disponibles
- `restart <resource>` - Reinicia un recurso
- `stop <resource>` - Detiene un recurso
- `start <resource>` - Inicia un recurso

### 4. Reiniciar un Recurso (Atajo Rápido)

**Dos formas de reiniciar recursos:**

#### Método 1: Menú Contextual
Haz **clic derecho** sobre el archivo `fxmanifest.lua` de cualquier recurso y selecciona **"Reiniciar Recurso"**.

La extensión:
1. Verificará que hay una conexión RCON activa (te pedirá conectar si no lo estás)
2. Obtendrá automáticamente el nombre de la carpeta del recurso
3. Ejecutará `ensure <nombre_carpeta>` en el servidor
4. Mostrará la respuesta en el Output Channel

#### Método 2: Paleta de Comandos
1. Presiona `Ctrl+Shift+P`
2. Ejecuta `FiveM: Reiniciar Recurso`
3. Ingresa el nombre del recurso cuando se te pida
4. El recurso será reiniciado

### 5. Desconectar

```
FiveM: Desconectar
```

## 🔧 Protocolo Técnico

Esta extensión implementa el **protocolo Quake 3** (Q3-compatible RCON) que usa FiveM:

### Formato de Mensaje
```
[Header OOB (4 bytes)][command name][space][data][null terminator]
```

- **Header OOB**: `0xFF 0xFF 0xFF 0xFF` (Out-Of-Band message)
- **Command Name**: `"rcon"`
- **Data**: `"<password> <command>"`

### Ejemplo de Paquete
Para el comando `status` con contraseña `123`:
```
FF FF FF FF 72 63 6F 6E 20 31 32 33 20 73 74 61 74 75 73 00
│           │              │         │                    │
│           │              │         │                    └─ Null terminator
│           │              │         └─ Command: "status"
│           │              └─ Password: "123"
│           └─ Command name: "rcon"
└─ OOB Header
```

### Respuestas del Servidor

El servidor responde con mensajes que también usan el header OOB:
```
FF FF FF FF 70 72 69 6E 74 20 [datos...]
│           │                 │
│           │                 └─ Respuesta del comando
│           └─ Command name: "print"
└─ OOB Header
```

## 🙏 Créditos

Esta implementación está basada en:
- [IceCon](https://github.com/icedream/icecon) - Cliente RCON Q3-compatible por Icedream
- [go-q3net](https://github.com/icedream/go-q3net) - Librería del protocolo Quake 3

## 🐛 Solución de Problemas

### Error: "Timeout de conexión"

**Causas posibles:**
1. El servidor FiveM no está ejecutándose
2. RCON no está habilitado en `server.cfg`
3. Puerto incorrecto
4. Firewall bloqueando UDP

**Soluciones:**
```bash
# 1. Verificar que el servidor esté escuchando
netstat -an | findstr :30120

# 2. Verificar server.cfg
cat resources/[local]/server/server.cfg | grep rcon

# 3. Probar conectividad
Test-NetConnection -ComputerName 127.0.0.1 -Port 30120
```

### Error: "No está conectado al servidor"

Primero ejecuta el comando "RCON: Conectar al Servidor" antes de enviar comandos.

### La contraseña no funciona

Verifica que la contraseña en `server.cfg` coincida exactamente (sin espacios extra):
```cfg
rcon_password "mi_contraseña"
```

## 📝 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `FiveM: Configurar Conexión` | Configura IP:Puerto y contraseña |
| `FiveM: Conectar al Servidor` | Establece conexión RCON |
| `FiveM: Enviar Comando` | Envía un comando al servidor |
| `FiveM: Reiniciar Recurso` | Reinicia un recurso (desde paleta o menú contextual) |
| `FiveM: Desconectar` | Cierra la conexión |
| `FiveM: Probar Conectividad UDP` | Prueba la conexión UDP al servidor |

## 🌐 Internacionalización

La extensión soporta múltiples idiomas y detecta automáticamente el idioma de VS Code.

**Idiomas soportados:**
- 🇺🇸 **Inglés** (English) - Idioma por defecto
- 🇪🇸 **Español** (Spanish)

Los mensajes de usuario se mostrarán en el idioma de tu VS Code. Los logs técnicos se mantienen en inglés para facilitar el debugging.

**Para agregar un nuevo idioma**, consulta el archivo [`INTERNATIONALIZATION.md`](./INTERNATIONALIZATION.md).

## 📄 Licencia

Este proyecto es código abierto. Ver la licencia del proyecto base [IceCon](https://github.com/icedream/icecon/blob/main/COPYING) (GPL-2.0).

## 🤝 Contribuir

¿Encontraste un bug? ¿Tienes una sugerencia? Abre un issue o pull request.

---

Hecho con ❤️ para la comunidad de FiveM
