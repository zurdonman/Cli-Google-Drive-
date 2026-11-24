#!/bin/sh
# Entorno mínimo para renderizar un film de lemo-opuscar dentro de un sandbox restringido
# (sondeo 2026-11-24: sin ffmpeg, sin Chromium y sin acceso a los GitHub Release assets).
#
# Deja, junto a la librería clonada:
#   $LIB/node_modules/@sparticuz/chromium + playwright-core + ffprobe-static
#   $BIN/ffmpeg  (n9, del wheel de PyPI imageio-ffmpeg)  y  $BIN/ffprobe (ffprobe-static)
#   $LIB/.nss/lib  (libnspr4/libnss3/libnssutil3 que el headless shell de Lambda necesita)
#
# Uso:  sh build/setup-film-env.sh /ruta/a/lemo-opuscar
# Luego, en cada orden:
#   export PATH=$LIB/.ffbin:$PATH PLAYWRIGHT_CHROME=$LIB/.ffbin/chromium \
#          LD_LIBRARY_PATH=$LIB/.nss/lib LEMO_ANGLE=swiftshader
set -eu
LIB=${1:?uso: sh setup-film-env.sh <carpeta de la librería lemo-opuscar>}
LIB=$(cd "$LIB" && pwd -P)
BIN="$LIB/.ffbin"; NSS="$LIB/.nss/lib"
mkdir -p "$BIN" "$NSS"

say() { printf '%s\n' "$*"; }

# 1 · paquetes de npm: navegador headless, playwright-core y un ffprobe
say "→ paquetes npm (chromium headless + ffprobe)"
( cd "$LIB" && npm install --no-audit --no-fund --loglevel=error \
    playwright-core@1.63.0 three@0.170.0 @sparticuz/chromium@153.0.0 ffprobe-static@3.1.0 )

# 2 · ffmpeg 9 desde el wheel de PyPI (no hace falta venv para extraerlo)
say "→ ffmpeg desde el wheel imageio-ffmpeg"
python3 - "$LIB" "$BIN" <<'PY'
import sys, os, stat, zipfile, tempfile, subprocess, glob
lib, out = sys.argv[1], sys.argv[2]
tmp = tempfile.mkdtemp()
subprocess.run([sys.executable, '-m', 'pip', 'download', 'imageio-ffmpeg', '-d', tmp, '--no-deps', '-q'], check=True)
whl = glob.glob(os.path.join(tmp, 'imageio_ffmpeg-*.whl'))[0]
with zipfile.ZipFile(whl) as z:
    name = [n for n in z.namelist() if n.rsplit('/', 1)[-1].startswith('ffmpeg-linux-x86_64')][0]
    dst = os.path.join(out, 'ffmpeg')
    with z.open(name) as src, open(dst, 'wb') as f:
        while True:
            b = src.read(1 << 22)
            if not b: break
            f.write(b)
os.chmod(dst, 0o755)
print('  ffmpeg →', dst)
PY

# 3 · ffprobe y el binario del navegador, copiados a $BIN
cp "$LIB/node_modules/ffprobe-static/bin/linux/x64/ffprobe" "$BIN/ffprobe"; chmod +x "$BIN/ffprobe"
NODE_BIN=$(node -e "import('@sparticuz/chromium').then(async m=>console.log(await m.default.executablePath()))")
cp "$NODE_BIN" "$BIN/chromium"; chmod +x "$BIN/chromium"

# 4 · libs de NSS/nspr que el binario de Lambda espera encontrar en /tmp/al2023
say "→ libnspr4 / libnss3 / libnssutil3 (del tar al2023 del paquete)"
python3 - "$LIB" "$NSS" <<'PY'
import sys, os, io, tarfile, subprocess
lib, out = sys.argv[1], sys.argv[2]
try:
    import brotli
except ImportError:
    subprocess.run([sys.executable, '-m', 'pip', 'install', '--break-system-packages', '-q', 'brotli'], check=False)
    import brotli
data = brotli.decompress(open(os.path.join(lib, 'node_modules/@sparticuz/chromium/bin/al2023.tar.br'), 'rb').read())
tarfile.open(fileobj=io.BytesIO(data)).extractall(os.path.dirname(out))
print('  libs →', out)
PY

say ""
say "listo. exporta esto antes de renderizar:"
say "  export PATH=$BIN:\$PATH PLAYWRIGHT_CHROME=$BIN/chromium LD_LIBRARY_PATH=$NSS LEMO_ANGLE=swiftshader"
say ""
say "comprobación rápida:"
say "  ffmpeg -version | head -1 && ffprobe -version | head -1"
say "  node -e \"import('playwright-core').then(async p=>{const b=await p.chromium.launch({executablePath:'$BIN/chromium',args:['--no-sandbox']});const g=await b.newPage();console.log(await g.evaluate(()=>'ok'));await b.close()})\""
