# Android ARM64: instalación plug-and-play

## Qué se instala

El release `android-arm64-v3.9.1` contiene un ejecutable real **`aarch64-linux-android`** de `glotlabs/gdrive`, enlazado contra Android/Bionic. Se ejecuta directamente en Termux.

- Android 7.0 o posterior (API 24) y CPU ARM64 (`aarch64`).
- No requiere root, Debian, proot, Rust, Cargo ni compilación en el teléfono.
- No emula x86_64.
- No es un APK ni una aplicación gráfica: es la skill/CLI para el harness.
- El binario se construye con Android NDK r27c en GitHub Actions desde el tag upstream `3.9.1`.
- El paquete incluye un archivo `.sha256`; `setup` no instala el binario si la verificación falla.

## Instalación en tres pasos

Instala una versión mantenida de Termux desde F-Droid o su repositorio GitHub. En Termux:

```bash
pkg update
pkg install -y git python

git clone https://github.com/zurdonman/Cli-Google-Drive-.git
cd Cli-Google-Drive-
python3 scripts/gdrive_skill.py setup
```

El instalador detecta Android ARM64, descarga `gdrive_android-arm64.tar.gz` y su checksum desde:

```text
https://github.com/zurdonman/Cli-Google-Drive-/releases/tag/android-arm64-v3.9.1
```

Lo instala en:

```text
~/.local/share/google-drive-skill/bin/gdrive
```

`bash scripts/termux_setup.sh` es un atajo equivalente. No instala proot ni compila código.

## OAuth y comprobación

```bash
python3 scripts/gdrive_skill.py doctor
python3 scripts/gdrive_skill.py account add
python3 scripts/gdrive_skill.py list
```

`doctor` debe informar de `platform.architecture: aarch64`, `platform.android: true` y `platform.termux: true`. Tras `setup`, el resultado incluye `precompiled: true` y `runtime: Termux / Android Bionic (sin proot)`.

Introduce las credenciales localmente y abre la URL de autorización en un navegador **del mismo teléfono**. Google redirige a `http://localhost:8085`, donde escucha el binario en Termux. No compartas Client ID, Client Secret, códigos OAuth ni tokens con el agente. Los tokens quedan en `~/.config/gdrive3/`, fuera del repositorio.

## Archivos del teléfono

```bash
termux-setup-storage
```

Concede el permiso cuando Android lo solicite. Después:

```bash
python3 scripts/gdrive_skill.py upload /sdcard/Download/informe.pdf
python3 scripts/gdrive_skill.py upload "/sdcard/DCIM/Camera" --recursive
python3 scripts/gdrive_skill.py download FILE_ID --destination /sdcard/Download
python3 scripts/gdrive_skill.py create nota.txt --content "Creado desde Android ARM64"
```

También funciona `/GoogleDrive` en un harness compatible instalado en Termux. No subas carpetas personales completas salvo petición expresa.

## Actualización o reinstalación

```bash
python3 scripts/gdrive_skill.py setup --release 3.9.1
```

La instalación es atómica y no borra las cuentas ni los tokens. Solo están disponibles las versiones que tengan un release `android-arm64-vX.Y.Z` en este repositorio.

Para instalar en otra ruta:

```bash
python3 scripts/gdrive_skill.py setup --install-dir /ruta/privada/bin
export GDRIVE_BIN=/ruta/privada/bin/gdrive
```

## Verificación manual del paquete

Normalmente no es necesario: `setup` lo hace automáticamente. Si descargas el release manualmente:

```bash
pkg install -y coreutils tar
sha256sum -c gdrive_android-arm64.tar.gz.sha256
tar -xzf gdrive_android-arm64.tar.gz
chmod 700 gdrive
./gdrive version
```

No ejecutes el archivo `.tar.gz` directamente; contiene el binario `gdrive`.

## Solución de problemas

### `unsupported_platform`

Comprueba `uname -m`. El paquete solo admite `aarch64`; no hay build para dispositivos Android de 32 bits ni x86. Ejecuta el adaptador en Termux, no dentro de proot.

### `checksum_mismatch` o `invalid_checksum`

No uses ese paquete. Borra descargas manuales y repite `setup` para obtener de nuevo el release y su checksum del repositorio oficial.

### `download_failed`

Comprueba la conexión y que exista el release `android-arm64-v3.9.1`. No sustituyas la URL por un binario de otra arquitectura.

### `Permission denied`

El instalador aplica permisos `700`. Si copiaste el binario manualmente, ejecuta `chmod 700 ./gdrive`. No lo ejecutes desde una partición compartida montada con `noexec`; instálalo en el home privado de Termux.

### OAuth no completa `localhost:8085`

Autoriza en el navegador del mismo teléfono y mantén Termux abierto. Si Android suspende el proceso, desactiva temporalmente la optimización de batería para Termux.

### No se puede leer `/sdcard`

Ejecuta `termux-setup-storage`, concede el permiso y reinicia Termux. Android puede limitar algunas carpetas por Scoped Storage; Download suele ser la opción más sencilla.

## Reproducir la compilación

Los mantenedores pueden reconstruir el release sin tocar un teléfono desde GitHub Actions:

```bash
gh workflow run release-android.yml --ref main -f gdrive_version=3.9.1
```

El workflow compila `aarch64-linux-android`, comprueba que el ELF sea AArch64 y use `/system/bin/linker64`, genera el paquete/SHA-256 y publica el release.
