# Google Drive Skill para agentes

Integración lista para un **harness de agentes**, basada en [`glotlabs/gdrive`](https://github.com/glotlabs/gdrive). Expone una skill `google-drive` y el comando **`/GoogleDrive`** para autenticar una cuenta y listar, subir, descargar, crear, actualizar, importar, exportar, mover, copiar, compartir y eliminar archivos.

No reimplementa la API de Drive: instala y adapta el CLI oficial de `glotlabs`, añadiendo una interfaz estable, salidas JSON, validaciones y guardas de seguridad adecuadas para agentes.

## Darle la URL a un agente

Pasa esta URL al agente:

```text
https://github.com/zurdonman/Cli-Google-Drive-
```

Prompt sugerido:

> Clona este repositorio, lee AGENTS.md y skills/google-drive/SKILL.md, instala la skill en mi harness y habilita /GoogleDrive. Después ejecuta doctor y dime cómo completar OAuth. No te enviaré secretos por el chat.

El archivo `AGENTS.md` guía el descubrimiento; `skills/google-drive/SKILL.md` contiene el procedimiento operativo y `.claude/commands/GoogleDrive.md` registra el comando `/GoogleDrive` al usar el repositorio como proyecto en un harness compatible con comandos de Claude.

## Inicio rápido

Requisitos: Python 3.10+ y Linux, macOS o Windows x86_64, o **Android ARM64 con Termux**. El adaptador usa únicamente la biblioteca estándar de Python.

```bash
git clone https://github.com/zurdonman/Cli-Google-Drive-.git
cd Cli-Google-Drive-

# 1. Instala el binario oficial 3.9.1 en el directorio de datos del usuario
python3 scripts/gdrive_skill.py setup

# 2. Comprueba el estado
python3 scripts/gdrive_skill.py doctor

# 3. OAuth: ejecútalo tú en una terminal interactiva
python3 scripts/gdrive_skill.py account add

# 4. Ya está disponible para el agente
python3 scripts/gdrive_skill.py list --max 10
```

También puedes usar un binario ya instalado en `PATH` o definir `GDRIVE_BIN=/ruta/a/gdrive`. Para instalar otra versión: `setup --release X.Y.Z`.

## Android ARM64 (aarch64) con Termux

Android está soportado con un **binario Android/Bionic ARM64 precompilado**. Funciona directamente en Termux: no necesita Debian, proot, Rust, compilación en el teléfono, emulación x86 ni root. Requiere Android 7.0+ (API 24) en un dispositivo `aarch64`.

Desde **Termux**:

```bash
pkg update
pkg install -y git python
git clone https://github.com/zurdonman/Cli-Google-Drive-.git
cd Cli-Google-Drive-
termux-setup-storage   # opcional: permite usar /sdcard/Download, etc.

# Descarga, verifica SHA-256 e instala gdrive 3.9.1 ARM64 precompilado
python3 scripts/gdrive_skill.py setup
python3 scripts/gdrive_skill.py doctor
python3 scripts/gdrive_skill.py account add
```

El paquete se genera con Android NDK en GitHub Actions y se publica en [Android ARM64 releases](https://github.com/zurdonman/Cli-Google-Drive-/releases/tag/android-arm64-v3.9.1). `setup` descarga el archivo y su checksum, verifica SHA-256 y lo instala en el directorio de datos del usuario. No hay toolchain ni pasos adicionales en el teléfono.

```bash
python3 scripts/gdrive_skill.py upload /sdcard/Download/informe.pdf
python3 scripts/gdrive_skill.py download FILE_ID --destination /sdcard/Download
```

Durante OAuth, abre la URL en el navegador del teléfono. El retorno a `http://localhost:8085` se completa en el mismo dispositivo; no uses ese enlace desde otro equipo. Los tokens se guardan en el home privado de Termux (`~/.config/gdrive3/`), no en Git.

Consulta [docs/ANDROID.md](docs/ANDROID.md) para reinstalación, rutas, solución de problemas y uso directo de `termux_setup.sh`.

### Autenticación Google OAuth

`gdrive` requiere un **Client ID y Client Secret de una app de escritorio** creados en Google Cloud:

1. Crea o selecciona un proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Habilita **Google Drive API**.
3. Configura la pantalla de consentimiento OAuth, los permisos de Drive y tu usuario de prueba.
4. Crea credenciales **OAuth client ID → Desktop app**.
5. Ejecuta `account add`, introduce las credenciales localmente y abre la URL de autorización.

Guía completa upstream: [create_google_api_credentials.md](https://github.com/glotlabs/gdrive/blob/main/docs/create_google_api_credentials.md). Las credenciales y tokens quedan en `~/.config/gdrive3/`, con acceso de solo lectura/escritura para el usuario; **nunca se almacenan en este repositorio**.

En un servidor remoto, el navegador no puede acceder al `localhost:8085` del servidor. Autentica primero en tu equipo y transfiere el archivo por un canal seguro:

```bash
# En tu equipo
gdrive account export MI_CUENTA
# En el servidor, después de copiar el archivo de forma segura
python3 scripts/gdrive_skill.py account import ./ARCHIVO.zip
```

El archivo exportado contiene tokens: trátalo como una contraseña y bórralo de forma segura tras importarlo.

## Uso

Todas las operaciones no interactivas devuelven JSON. Ejemplo:

```json
{
  "ok": true,
  "command": "mkdir",
  "data": {
    "id": "1AbC...",
    "name": "Entregables"
  }
}
```

### Archivos y carpetas

```bash
# Listar raíz, carpeta o consulta de Drive
python3 scripts/gdrive_skill.py list --max 30
python3 scripts/gdrive_skill.py list --parent FOLDER_ID
python3 scripts/gdrive_skill.py list --query "name contains 'informe' and trashed = false"

# Subir archivos o directorios
python3 scripts/gdrive_skill.py upload ./informe.pdf --parent FOLDER_ID
python3 scripts/gdrive_skill.py upload ./proyecto --recursive --parent FOLDER_ID

# Crear contenido sin tener que crear manualmente un archivo local
python3 scripts/gdrive_skill.py create nota.md --content "# Nota" --parent FOLDER_ID
cat ./nota.md | python3 scripts/gdrive_skill.py create nota.md

# Crear carpeta, descargar y actualizar
python3 scripts/gdrive_skill.py mkdir Entregables --parent FOLDER_ID
python3 scripts/gdrive_skill.py download FILE_ID --destination ./Downloads
python3 scripts/gdrive_skill.py download FOLDER_ID --destination ./Downloads --recursive
python3 scripts/gdrive_skill.py update FILE_ID ./informe-final.pdf

# Otros
python3 scripts/gdrive_skill.py info FILE_ID
python3 scripts/gdrive_skill.py rename FILE_ID nuevo-nombre.pdf
python3 scripts/gdrive_skill.py move FILE_ID FOLDER_ID
python3 scripts/gdrive_skill.py copy FILE_ID FOLDER_ID
```

El destino de `download` debe ser un directorio existente. Para carpetas se necesita `--recursive`; para reemplazar archivos locales, `--overwrite`.

### Documentos de Google y permisos

```bash
python3 scripts/gdrive_skill.py import ./datos.csv --parent FOLDER_ID
python3 scripts/gdrive_skill.py export DOCUMENT_ID ./documento.pdf

python3 scripts/gdrive_skill.py share FILE_ID --type user --email persona@example.com --role reader
python3 scripts/gdrive_skill.py share FILE_ID --type anyone --role reader

# Requiere confirmación explícita
python3 scripts/gdrive_skill.py delete FILE_ID --yes
python3 scripts/gdrive_skill.py delete FOLDER_ID --recursive --yes
```

`raw` expone cualquier función presente upstream que aún no tenga atajo:

```bash
python3 scripts/gdrive_skill.py raw -- drives list
python3 scripts/gdrive_skill.py raw -- permissions list FILE_ID
python3 scripts/gdrive_skill.py --help
```

## Integración en un harness

### Como proyecto

Al clonar el repositorio como proyecto, el agente debe leer `AGENTS.md` y la skill. En harness compatibles con `.claude/commands`, usa:

```text
/GoogleDrive sube ./informe.pdf a mi Drive
/GoogleDrive crea una carpeta llamada Entregables y súbeme el directorio ./salida
/GoogleDrive descarga FILE_ID en ./Downloads
```

### Como skill aislada (Agent Skills)

Instala una copia portable que incluye su propio adaptador:

```bash
# Estándar .agents/skills dentro del proyecto actual
python3 /ruta/Cli-Google-Drive-/scripts/install_skill.py

# O en el directorio de skills de tu harness
python3 /ruta/Cli-Google-Drive-/scripts/install_skill.py --target ~/.claude/skills
```

El instalador no sobrescribe una skill existente. Tras instalarla, reinicia o recarga las skills del harness si este lo requiere. `/GoogleDrive` está incluido al clonar como proyecto; en otros harness, registra un comando equivalente que apunte a la skill instalada si no detectan comandos automáticamente.

## Códigos de salida y seguridad

- `0`: éxito; `2`: argumentos/confirmación; `3`: instalación/dependencia; `4`: autenticación; `5`: error de Drive; `130`: cancelación.
- Los errores también se devuelven como JSON con `error.code` y `error.message`.
- `delete` exige `--yes`; compartir públicamente o borrar recursivamente requiere además confirmación humana por parte del agente.
- No registres tokens, archives de cuentas ni credenciales en logs, prompts o Git. `.gitignore` excluye los patrones más habituales.
- El instalador usa releases HTTPS, valida las rutas de los archivos comprimidos y exige SHA-256 en el paquete precompilado de Android ARM64.

## Desarrollo y pruebas

```bash
python3 -m unittest discover -s tests -v
python3 -m py_compile scripts/gdrive_skill.py scripts/install_skill.py
bash -n scripts/termux_setup.sh
```

## Licencia y atribución

MIT para este adaptador. `gdrive` es un proyecto de [glotlabs](https://github.com/glotlabs/gdrive), también distribuido bajo MIT; consulta `NOTICE`.
