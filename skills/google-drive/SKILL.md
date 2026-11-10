---
name: google-drive
description: Conecta Google Drive con un agente mediante glotlabs/gdrive. Usar cuando el usuario pida /GoogleDrive, autenticar Drive, listar, buscar, subir, descargar, crear o actualizar archivos y carpetas, importar/exportar documentos, mover, copiar, compartir o eliminar contenido de Drive.
---

# Google Drive

Adaptador para agentes basado en el binario oficial `glotlabs/gdrive`. Todas las operaciones no interactivas devuelven JSON con `ok`, `command`, `data` y, cuando aplica, `raw`.

## Localizar el adaptador

Desde la raíz del repositorio clonado, el comando base es:

```bash
python3 scripts/gdrive_skill.py <comando>
```

Si esta skill se instaló de forma aislada con `install_skill.py`, el mismo adaptador está en `scripts/gdrive_skill.py` dentro del directorio de esta skill. Usa rutas absolutas cuando el directorio de trabajo del harness pueda cambiar.

## Flujo obligatorio

1. Ejecuta `doctor` y revisa `platform`. Si `installed` es `false`, ejecuta `setup`: instala el binario oficial en x86_64; en Android/Termux ARM64 instala directamente el binario Android/Bionic aarch64 precompilado, con verificación SHA-256. No necesita proot, Rust ni compilación en el teléfono.
2. Si `authenticated` es `false`, explica al usuario que debe completar OAuth en su terminal con `account add`. No solicites Client ID, Client Secret, códigos OAuth ni tokens por el chat. En un servidor remoto, el usuario puede importar localmente un archivo de cuenta con `account import`.
3. Usa `list` para descubrir IDs. No inventes IDs de Drive.
4. Ejecuta la operación pedida y comprueba `ok`. Devuelve al usuario los IDs y rutas relevantes.

```bash
python3 scripts/gdrive_skill.py doctor
python3 scripts/gdrive_skill.py setup
python3 scripts/gdrive_skill.py account add       # interactivo, solo el usuario
python3 scripts/gdrive_skill.py list --max 20
```

## Operaciones habituales

```bash
# Subir un archivo o, con --recursive, una carpeta
python3 scripts/gdrive_skill.py upload ./informe.pdf --parent FOLDER_ID
python3 scripts/gdrive_skill.py upload ./carpeta --recursive

# Crear un archivo de texto (o leer el contenido desde stdin)
python3 scripts/gdrive_skill.py create nota.txt --content "Hola" --parent FOLDER_ID
printf '# Título\n' | python3 scripts/gdrive_skill.py create nota.md

# Crear carpeta y descargar archivo/carpeta
python3 scripts/gdrive_skill.py mkdir "Documentos agente" --parent FOLDER_ID
python3 scripts/gdrive_skill.py download FILE_ID --destination ./Downloads
python3 scripts/gdrive_skill.py download FOLDER_ID --destination ./Downloads --recursive

# Actualizar, renombrar, mover, copiar y compartir
python3 scripts/gdrive_skill.py update FILE_ID ./informe-v2.pdf
python3 scripts/gdrive_skill.py rename FILE_ID "nuevo-nombre.pdf"
python3 scripts/gdrive_skill.py move FILE_ID FOLDER_ID
python3 scripts/gdrive_skill.py copy FILE_ID FOLDER_ID
python3 scripts/gdrive_skill.py share FILE_ID --type user --email persona@example.com --role reader

# Documentos de Google
python3 scripts/gdrive_skill.py import ./datos.csv --parent FOLDER_ID
python3 scripts/gdrive_skill.py export DOCUMENT_ID ./documento.pdf --overwrite

# Consultar metadatos o usar cualquier función del CLI original
python3 scripts/gdrive_skill.py info FILE_ID
python3 scripts/gdrive_skill.py raw -- drives list
```

`--parent` puede repetirse en `upload`, `create`, `mkdir` e `import`. Para búsquedas, `list --query` acepta la sintaxis de Google Drive; no combines `--query` con `--parent`/`--drive`, porque upstream da prioridad a estos últimos.

## Seguridad

- Nunca leas, muestres ni copies `~/.config/gdrive3/`, archivos de cuenta exportados o tokens hacia la salida.
- No subas secretos, `.git`, credenciales ni archivos ajenos a la petición.
- `delete` es destructivo: requiere confirmación explícita del usuario y el flag `--yes`. Usa `--recursive` solo si el usuario pidió borrar también el contenido.
- No sobrescribas descargas ni exportaciones sin autorización; `--overwrite` debe corresponder a la petición.
- Antes de compartir públicamente (`--type anyone`) o conceder escritura/propiedad, pide confirmación.
- No ejecutes `account add` en segundo plano: abre un servidor OAuth temporal en `localhost:8085` y necesita interacción del usuario.

Más detalles y solución de problemas: `README.md` del repositorio o la documentación incluida junto a esta skill.
