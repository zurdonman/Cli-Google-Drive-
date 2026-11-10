# Android ARM64 / Termux

## Arquitectura soportada

Esta integración admite dispositivos Android **ARM64 (`aarch64`)** mediante Termux y una distribución Debian en `proot-distro`. `glotlabs/gdrive` no publica releases ARM64 ni binarios Android/Bionic, por lo que `termux_setup.sh` compila su código fuente para ARM64 dentro del entorno GNU/Linux.

- No necesita root.
- No usa emulación x86_64.
- No es un APK ni una aplicación Android con interfaz gráfica.
- El agente y el adaptador Python se ejecutan en Termux; el binario `gdrive` se ejecuta en Debian/proot mediante un lanzador transparente.
- Las operaciones de Drive son las mismas que en escritorio, incluida `/GoogleDrive` si el harness está instalado en Termux.

## Instalación

Instala una versión mantenida de Termux desde F-Droid o su repositorio GitHub. Después, **en Termux**, no dentro de una sesión proot:

```bash
pkg update
pkg install -y git python
git clone https://github.com/zurdonman/Cli-Google-Drive-.git
cd Cli-Google-Drive-

# Opcional, para leer/escribir en Descargas y otras carpetas compartidas
termux-setup-storage

python3 scripts/gdrive_skill.py setup
```

El mismo resultado puede obtenerse directamente con:

```bash
bash scripts/termux_setup.sh
```

El instalador:

1. Comprueba que el dispositivo es `aarch64` y que está en Termux.
2. Instala `proot-distro` y Debian si no existen.
3. Instala Rust/Cargo y dependencias de compilación dentro de Debian.
4. Clona el tag fijado `3.9.1` de `glotlabs/gdrive` y ejecuta `cargo install --locked`.
5. Instala un lanzador en `~/.local/share/google-drive-skill/bin/gdrive`.
6. Comprueba `gdrive version` a través del lanzador.

Puedes personalizar la compilación:

```bash
GDRIVE_BUILD_JOBS=1 python3 scripts/gdrive_skill.py setup
GDRIVE_RELEASE=3.9.1 bash scripts/termux_setup.sh
# Otra distribución compatible con apt, ya instalada o instalable por proot-distro:
GDRIVE_PROOT_DISTRO=ubuntu bash scripts/termux_setup.sh
```

En teléfonos con poca memoria usa `GDRIVE_BUILD_JOBS=1`. Reserva varios GB para Debian, Rust y los artefactos temporales de compilación. El directorio temporal del código se elimina al terminar correctamente.

## OAuth en el teléfono

Desde Termux:

```bash
python3 scripts/gdrive_skill.py account add
```

Introduce las credenciales localmente, abre la URL mostrada en un navegador **del mismo teléfono** y autoriza Drive. Google redirigirá a `http://localhost:8085`; ese localhost es el dispositivo Android, donde `gdrive` está escuchando a través de proot.

No envíes Client ID, Client Secret, códigos de autorización ni tokens al agente. Las credenciales se guardan en el home de Debian/proot (normalmente `/root/.config/gdrive3/` cuando proot inicia como root), fuera del repositorio.

Comprueba el estado:

```bash
python3 scripts/gdrive_skill.py doctor
```

El JSON incluye `platform.architecture: aarch64`, `platform.android: true` y `platform.termux: true`.

## Archivos del teléfono

Tras `termux-setup-storage`, concede el permiso de almacenamiento cuando Android lo solicite. Ejemplos:

```bash
python3 scripts/gdrive_skill.py upload /sdcard/Download/informe.pdf
python3 scripts/gdrive_skill.py upload "/sdcard/DCIM/Camera" --recursive
python3 scripts/gdrive_skill.py download FILE_ID --destination /sdcard/Download
python3 scripts/gdrive_skill.py create nota.txt --content "Creado desde Android ARM64"
```

Respeta los permisos y la privacidad: no subas DCIM, Documentos ni otros directorios completos salvo petición expresa.

## Reinstalación y actualización

`setup` recompila y sustituye el binario dentro de Debian; el lanzador se actualiza de forma atómica. No borra la cuenta ni los tokens. Para usar otra versión compatible:

```bash
python3 scripts/gdrive_skill.py setup --release X.Y.Z
```

El lanzador no se instala en Git. Para usar otro binario ARM64 compatible, define `GDRIVE_BIN=/ruta/absoluta/a/gdrive`.

## Solución de problemas

### `unsupported_platform` o intenta descargar un x64

Estás dentro de Debian/proot o fuera de Termux. Sal de proot y ejecuta `python3 scripts/gdrive_skill.py setup` directamente en Termux. El instalador de Android se activa con `PREFIX` de Termux y arquitectura `aarch64`.

### Fallo de Cargo por memoria o el teléfono se queda sin espacio

```bash
GDRIVE_BUILD_JOBS=1 python3 scripts/gdrive_skill.py setup
```

Libera espacio antes de repetir. No uses más trabajos paralelos en un dispositivo con poca RAM.

### El navegador no completa localhost:8085

Asegúrate de autorizar en el navegador del mismo teléfono y mantén Termux abierto durante OAuth. Si Android suspende Termux, desactiva temporalmente su optimización de batería y adquiere un wakelock con `termux-wake-lock` si está disponible.

### No se puede leer `/sdcard`

Ejecuta `termux-setup-storage`, concede el permiso y reinicia Termux. Algunas carpetas de Android están limitadas por Scoped Storage; utiliza Download o copia el archivo al home de Termux.

### `binary_not_found` después de compilar

Comprueba:

```bash
~/.local/share/google-drive-skill/bin/gdrive version
python3 scripts/gdrive_skill.py doctor
```

Si el lanzador está en otra ubicación porque usaste `GDRIVE_INSTALL_DIR`, exporta `GDRIVE_BIN` con esa ruta.
