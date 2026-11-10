#!/usr/bin/env python3
"""Agent-friendly adapter for glotlabs/gdrive (Python standard library only)."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import platform
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.error
import urllib.request
import zipfile
from typing import Optional, Union

UPSTREAM_REPOSITORY = "https://github.com/glotlabs/gdrive"
DEFAULT_RELEASE = "3.9.1"
USER_AGENT = "GoogleDrive-Agent-Skill/1.1"


class SkillError(Exception):
    def __init__(self, message: str, code: str = "command_failed", exit_code: int = 1):
        super().__init__(message)
        self.code = code
        self.exit_code = exit_code


def emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def is_termux() -> bool:
    return "com.termux/files/usr" in os.environ.get("PREFIX", "")


def platform_details() -> dict:
    return {
        "system": platform.system().lower(),
        "architecture": platform.machine().lower(),
        "android": bool(os.environ.get("ANDROID_ROOT")) or Path("/system/build.prop").exists(),
        "termux": is_termux(),
    }


def default_install_dir() -> Path:
    if os.name == "nt":
        base = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
        return base / "GoogleDriveSkill" / "bin"
    base = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    return base / "google-drive-skill" / "bin"


def find_binary(required: bool = True) -> Optional[str]:
    configured = os.environ.get("GDRIVE_BIN")
    candidates = [configured] if configured else []
    executable = "gdrive.exe" if os.name == "nt" else "gdrive"
    candidates.append(str(default_install_dir() / executable))
    candidates.append(shutil.which("gdrive"))
    for candidate in candidates:
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return str(Path(candidate).resolve())
    if required:
        hint = (
            "Ejecuta 'python3 scripts/gdrive_skill.py setup' para compilar gdrive ARM64 en proot."
            if is_termux() and platform.machine().lower() == "aarch64"
            else "Ejecuta 'python3 scripts/gdrive_skill.py setup'."
        )
        raise SkillError(
            f"No se encontró gdrive. {hint} También puedes definir GDRIVE_BIN.",
            "binary_not_found",
            3,
        )
    return None


def run_gdrive(args: list[str], interactive: bool = False) -> subprocess.CompletedProcess:
    command = [find_binary(), *args]
    try:
        if interactive:
            return subprocess.run(command, check=False)
        return subprocess.run(command, check=False, capture_output=True, text=True)
    except OSError as exc:
        raise SkillError(f"No se pudo ejecutar gdrive: {exc}", "execution_failed", 3) from exc


def checked(args: list[str]) -> tuple[str, str]:
    result = run_gdrive(args)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        lowered = detail.lower()
        auth_error = any(term in lowered for term in ("account", "token", "oauth", "unauthorized"))
        raise SkillError(
            detail or f"gdrive terminó con código {result.returncode}",
            "authentication_required" if auth_error else "gdrive_error",
            4 if auth_error else 5,
        )
    return result.stdout.strip(), result.stderr.strip()


def result(command: str, data: Optional[Union[dict, list, str]] = None, raw: str = "") -> dict:
    payload = {"ok": True, "command": command}
    if data is not None:
        payload["data"] = data
    if raw:
        payload["raw"] = raw
    return payload


def download_file(url: str, destination: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=60) as response, destination.open("wb") as output:
            shutil.copyfileobj(response, output)
    except (urllib.error.URLError, OSError) as exc:
        raise SkillError(f"No se pudo descargar {url}: {exc}", "download_failed", 3) from exc


def safe_member_path(member_name: str, destination: Path) -> Path:
    target = (destination / member_name).resolve()
    if destination.resolve() not in target.parents and target != destination.resolve():
        raise SkillError("El paquete descargado contiene rutas no seguras.", "unsafe_archive", 3)
    return target


def extract_binary(archive: Path, destination: Path, windows: bool) -> Path:
    expected = "gdrive.exe" if windows else "gdrive"
    extracted: list[Path] = []
    if windows:
        with zipfile.ZipFile(archive) as bundle:
            for member in bundle.infolist():
                target = safe_member_path(member.filename, destination)
                if not member.is_dir():
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with bundle.open(member) as source, target.open("wb") as output:
                        shutil.copyfileobj(source, output)
                    extracted.append(target)
    else:
        with tarfile.open(archive, "r:gz") as bundle:
            for member in bundle.getmembers():
                if not member.isfile():
                    continue
                target = safe_member_path(member.name, destination)
                target.parent.mkdir(parents=True, exist_ok=True)
                source = bundle.extractfile(member)
                if source is None:
                    continue
                with source, target.open("wb") as output:
                    shutil.copyfileobj(source, output)
                extracted.append(target)
    matches = [path for path in extracted if path.name == expected]
    if len(matches) != 1:
        raise SkillError("El paquete no contiene el binario gdrive esperado.", "invalid_archive", 3)
    return matches[0]


def setup_termux(args: argparse.Namespace, version: str) -> dict:
    """Compile an aarch64 binary in proot; upstream publishes x86_64 only."""
    installer = Path(__file__).resolve().with_name("termux_setup.sh")
    if not installer.is_file():
        raise SkillError("Falta el instalador scripts/termux_setup.sh.", "installer_not_found", 3)
    environment = os.environ.copy()
    environment["GDRIVE_RELEASE"] = version
    if args.install_dir:
        environment["GDRIVE_INSTALL_DIR"] = str(Path(args.install_dir).expanduser().resolve())
    try:
        completed = subprocess.run(["bash", str(installer)], env=environment, check=False)
    except OSError as exc:
        raise SkillError(f"No se pudo iniciar el instalador de Termux: {exc}", "execution_failed", 3) from exc
    if completed.returncode:
        raise SkillError(
            "La compilación ARM64 no se completó. Revisa la salida anterior y el espacio disponible.",
            "android_build_failed",
            3,
        )
    binary = str(Path(args.install_dir).expanduser().resolve() / "gdrive") if args.install_dir else find_binary()
    version_output, _ = checked_with_binary(binary, ["version"])
    return result("setup", {
        "binary": binary,
        "version": version_output,
        "source": f"{UPSTREAM_REPOSITORY}/tree/{version}",
        "platform": "android-arm64",
        "runtime": f"Termux + {os.environ.get('GDRIVE_PROOT_DISTRO', 'debian')} proot",
    })


def setup(args: argparse.Namespace) -> dict:
    system = platform.system().lower()
    machine = platform.machine().lower()
    version = args.version.lstrip("v")
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version):
        raise SkillError("La versión debe tener el formato X.Y.Z.", "invalid_version", 2)
    if is_termux() and machine == "aarch64":
        return setup_termux(args, version)
    if machine not in ("x86_64", "amd64"):
        detail = " En Android ARM64 ejecuta este comando desde Termux." if platform_details()["android"] else ""
        raise SkillError(
            f"Arquitectura {machine} sin binario oficial (los releases son x86_64).{detail}",
            "unsupported_platform",
            3,
        )
    if system == "linux":
        asset = f"gdrive_linux-x64.tar.gz"
    elif system == "darwin":
        asset = "gdrive_macos-x64.tar.gz"
    elif system == "windows":
        asset = "gdrive_windows-x64.zip"
    else:
        raise SkillError(f"Sistema no soportado: {system}", "unsupported_platform", 3)
    url = f"{UPSTREAM_REPOSITORY}/releases/download/{version}/{asset}"
    install_dir = Path(args.install_dir).expanduser() if args.install_dir else default_install_dir()
    install_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="gdrive-skill-") as temporary:
        temporary_path = Path(temporary)
        archive = temporary_path / asset
        download_file(url, archive)
        binary = extract_binary(archive, temporary_path, system == "windows")
        target = install_dir / binary.name
        staged = install_dir / f".{binary.name}.tmp"
        shutil.copyfile(binary, staged)
        staged.chmod(0o755)
        staged.replace(target)
    version_output, _ = checked_with_binary(str(target), ["version"])
    return result("setup", {"binary": str(target), "version": version_output, "source": url})


def checked_with_binary(binary: str, args: list[str]) -> tuple[str, str]:
    completed = subprocess.run([binary, *args], capture_output=True, text=True, check=False)
    if completed.returncode:
        raise SkillError(completed.stderr.strip() or "gdrive version falló", "installation_failed", 3)
    return completed.stdout.strip(), completed.stderr.strip()


def parse_tabular(output: str, fields: list[str]) -> list[dict]:
    rows = []
    for line in output.splitlines():
        if line.strip():
            values = line.split("\t")
            rows.append({field: values[index] if index < len(values) else "" for index, field in enumerate(fields)})
    return rows


def temporary_content_file(name: str, content: Optional[str]) -> tempfile.TemporaryDirectory:
    if not name or Path(name).name != name or name in (".", ".."):
        raise SkillError("El nombre debe ser un nombre de archivo, no una ruta.", "invalid_name", 2)
    directory = tempfile.TemporaryDirectory(prefix="gdrive-create-")
    path = Path(directory.name) / name
    if content is None:
        content = sys.stdin.read()
    path.write_text(content, encoding="utf-8")
    return directory


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="gdrive-skill",
        description="Skill de Google Drive para agentes, basada en glotlabs/gdrive.",
    )
    parser.add_argument("--version", action="version", version="gdrive-skill 1.1.0")
    commands = parser.add_subparsers(dest="command", required=True)

    setup_parser = commands.add_parser("setup", help="Instala gdrive x86_64 o lo compila para Android ARM64")
    setup_parser.add_argument("--release", dest="version", default=DEFAULT_RELEASE)
    setup_parser.add_argument("--install-dir")
    commands.add_parser("doctor", help="Comprueba instalación y autenticación")

    account = commands.add_parser("account", help="Gestiona cuentas OAuth").add_subparsers(dest="action", required=True)
    account.add_parser("list")
    account.add_parser("current")
    account.add_parser("add", help="Flujo OAuth interactivo; no pedir secretos por chat")
    switch = account.add_parser("switch")
    switch.add_argument("name")
    export = account.add_parser("export")
    export.add_argument("name")
    import_parser = account.add_parser("import")
    import_parser.add_argument("archive", type=Path)

    list_parser = commands.add_parser("list", help="Lista archivos como JSON")
    list_parser.add_argument("--parent")
    list_parser.add_argument("--drive")
    list_parser.add_argument("--query")
    list_parser.add_argument("--order-by")
    list_parser.add_argument("--max", type=int, default=30)

    upload = commands.add_parser("upload", help="Sube un archivo o directorio")
    upload.add_argument("path", type=Path)
    upload.add_argument("--parent", action="append")
    upload.add_argument("--mime")
    upload.add_argument("--recursive", action="store_true")
    upload.add_argument("--chunk-size", type=int)

    create = commands.add_parser("create", help="Crea un archivo con texto o stdin")
    create.add_argument("name")
    create.add_argument("--content")
    create.add_argument("--parent", action="append")
    create.add_argument("--mime", default="text/plain")

    mkdir = commands.add_parser("mkdir", help="Crea una carpeta")
    mkdir.add_argument("name")
    mkdir.add_argument("--parent", action="append")

    download = commands.add_parser("download", help="Descarga a un directorio existente")
    download.add_argument("file_id")
    download.add_argument("--destination", type=Path, default=Path.cwd())
    download.add_argument("--overwrite", action="store_true")
    download.add_argument("--recursive", action="store_true")
    download.add_argument("--follow-shortcuts", action="store_true")

    for name, help_text in (("info", "Obtiene metadatos"), ("update", "Actualiza contenido")):
        item = commands.add_parser(name, help=help_text)
        item.add_argument("file_id")
        if name == "update":
            item.add_argument("path", type=Path)
            item.add_argument("--mime")

    for name in ("import", "export"):
        item = commands.add_parser(name)
        item.add_argument("file_id" if name == "export" else "path", type=Path if name == "import" else str)
        if name == "export":
            item.add_argument("path", type=Path)
            item.add_argument("--overwrite", action="store_true")
        else:
            item.add_argument("--parent", action="append")

    rename = commands.add_parser("rename")
    rename.add_argument("file_id")
    rename.add_argument("name")
    for name in ("move", "copy"):
        item = commands.add_parser(name)
        item.add_argument("file_id")
        item.add_argument("folder_id")
    delete = commands.add_parser("delete")
    delete.add_argument("file_id")
    delete.add_argument("--recursive", action="store_true")
    delete.add_argument("--yes", action="store_true", help="Confirmación obligatoria")

    share = commands.add_parser("share")
    share.add_argument("file_id")
    share.add_argument("--role", default="reader", choices=["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"])
    share.add_argument("--type", default="user", choices=["user", "group", "domain", "anyone"])
    share.add_argument("--email")
    share.add_argument("--domain")
    share.add_argument("--discoverable", action="store_true")

    raw = commands.add_parser("raw", help="Pasa argumentos directamente a gdrive")
    raw.add_argument("args", nargs=argparse.REMAINDER)
    return parser


def execute(args: argparse.Namespace) -> dict:
    command = args.command
    if command == "setup":
        return setup(args)
    if command == "doctor":
        binary = find_binary(required=False)
        data = {"binary": binary, "installed": binary is not None, "authenticated": False, "account": None, "platform": platform_details()}
        if is_termux() and platform.machine().lower() == "aarch64" and not binary:
            data["install_command"] = "python3 scripts/gdrive_skill.py setup"
        if binary:
            data["version"] = checked_with_binary(binary, ["version"])[0]
            current = run_gdrive(["account", "current"])
            data["authenticated"] = current.returncode == 0
            if current.returncode == 0:
                data["account"] = current.stdout.strip()
        return result(command, data)
    if command == "account":
        if args.action == "add":
            code = run_gdrive(["account", "add"], interactive=True).returncode
            if code:
                raise SkillError("La autenticación no se completó.", "authentication_failed", 4)
            return result("account.add", {"authenticated": True})
        if args.action == "list":
            output, _ = checked(["account", "list"])
            return result("account.list", {"accounts": [line.strip() for line in output.splitlines() if line.strip()]}, output)
        if args.action == "current":
            output, _ = checked(["account", "current"])
            return result("account.current", {"account": output})
        mapping = {"switch": ["account", "switch", args.name], "export": ["account", "export", args.name], "import": ["account", "import", str(args.archive)]}
        output, _ = checked(mapping[args.action])
        return result(f"account.{args.action}", raw=output)
    if command == "list":
        if args.max < 1:
            raise SkillError("--max debe ser mayor que cero.", "invalid_argument", 2)
        gargs = ["files", "list", "--max", str(args.max), "--skip-header", "--full-name", "--field-separator", "\t"]
        for option, value in (("--parent", args.parent), ("--drive", args.drive), ("--query", args.query), ("--order-by", args.order_by)):
            if value is not None:
                gargs.extend([option, value])
        output, _ = checked(gargs)
        files = parse_tabular(output, ["id", "name", "type", "size", "created"])
        return result(command, {"files": files, "count": len(files)})
    if command == "upload":
        path = args.path.expanduser().resolve()
        if not path.exists():
            raise SkillError(f"No existe la ruta local: {path}", "local_path_not_found", 2)
        if path.is_dir() and not args.recursive:
            raise SkillError("Para subir un directorio usa --recursive.", "recursive_required", 2)
        gargs = ["files", "upload", str(path), "--print-only-id"]
        for parent in args.parent or []:
            gargs.extend(["--parent", parent])
        for option, value in (("--mime", args.mime), ("--chunk-size", args.chunk_size)):
            if value is not None:
                gargs.extend([option, str(value)])
        if args.recursive:
            gargs.append("--recursive")
        output, _ = checked(gargs)
        return result(command, {"id": output.strip(), "source": str(path), "recursive": args.recursive})
    if command == "create":
        with temporary_content_file(args.name, args.content) as directory:
            path = Path(directory) / args.name
            gargs = ["files", "upload", str(path), "--print-only-id", "--mime", args.mime]
            for parent in args.parent or []:
                gargs.extend(["--parent", parent])
            output, _ = checked(gargs)
        return result(command, {"id": output.strip(), "name": args.name})
    if command == "mkdir":
        gargs = ["files", "mkdir", args.name, "--print-only-id"]
        for parent in args.parent or []:
            gargs.extend(["--parent", parent])
        output, _ = checked(gargs)
        return result(command, {"id": output.strip(), "name": args.name})
    if command == "download":
        destination = args.destination.expanduser().resolve()
        if not destination.is_dir():
            raise SkillError("El destino debe ser un directorio existente.", "invalid_destination", 2)
        gargs = ["files", "download", args.file_id, "--destination", str(destination)]
        for enabled, flag in ((args.overwrite, "--overwrite"), (args.recursive, "--recursive"), (args.follow_shortcuts, "--follow-shortcuts")):
            if enabled:
                gargs.append(flag)
        output, _ = checked(gargs)
        return result(command, {"file_id": args.file_id, "destination": str(destination)}, output)
    if command == "info":
        output, _ = checked(["files", "info", args.file_id, "--size-in-bytes"])
        return result(command, {"file_id": args.file_id}, output)
    if command == "update":
        path = args.path.expanduser().resolve()
        if not path.is_file():
            raise SkillError("El archivo local no existe.", "local_path_not_found", 2)
        gargs = ["files", "update", args.file_id, str(path)]
        if args.mime:
            gargs.extend(["--mime", args.mime])
        output, _ = checked(gargs)
        return result(command, {"file_id": args.file_id, "source": str(path)}, output)
    if command == "import":
        path = args.path.expanduser().resolve()
        if not path.is_file():
            raise SkillError("El archivo local no existe.", "local_path_not_found", 2)
        gargs = ["files", "import", str(path), "--print-only-id"]
        for parent in args.parent or []:
            gargs.extend(["--parent", parent])
        output, _ = checked(gargs)
        return result(command, {"id": output.strip(), "source": str(path)})
    if command == "export":
        gargs = ["files", "export", args.file_id, str(args.path.expanduser().resolve())]
        if args.overwrite:
            gargs.append("--overwrite")
        output, _ = checked(gargs)
        return result(command, {"file_id": args.file_id, "path": str(args.path.expanduser().resolve())}, output)
    if command in ("rename", "move", "copy"):
        operation = "mv" if command == "move" else command
        second = args.name if command == "rename" else args.folder_id
        output, _ = checked(["files", operation, args.file_id, second])
        return result(command, {"file_id": args.file_id}, output)
    if command == "delete":
        if not args.yes:
            raise SkillError("Operación destructiva cancelada: añade --yes para confirmar.", "confirmation_required", 2)
        gargs = ["files", "delete", args.file_id]
        if args.recursive:
            gargs.append("--recursive")
        output, _ = checked(gargs)
        return result(command, {"file_id": args.file_id, "deleted": True}, output)
    if command == "share":
        if args.type in ("user", "group") and not args.email:
            raise SkillError("--email es obligatorio para usuarios y grupos.", "invalid_argument", 2)
        if args.type == "domain" and not args.domain:
            raise SkillError("--domain es obligatorio para compartir con un dominio.", "invalid_argument", 2)
        gargs = ["permissions", "share", args.file_id, "--role", args.role, "--type", args.type]
        for option, value in (("--email", args.email), ("--domain", args.domain)):
            if value:
                gargs.extend([option, value])
        if args.discoverable:
            gargs.append("--discoverable")
        output, _ = checked(gargs)
        return result(command, {"file_id": args.file_id, "role": args.role, "type": args.type}, output)
    if command == "raw":
        raw_args = args.args[1:] if args.args[:1] == ["--"] else args.args
        if not raw_args:
            raise SkillError("Indica argumentos para gdrive después de --.", "invalid_argument", 2)
        output, _ = checked(raw_args)
        return result(command, {"args": raw_args}, output)
    raise SkillError(f"Comando no implementado: {command}", "invalid_argument", 2)


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        emit(execute(args))
        return 0
    except SkillError as exc:
        emit({"ok": False, "command": args.command, "error": {"code": exc.code, "message": str(exc)}})
        return exc.exit_code
    except KeyboardInterrupt:
        emit({"ok": False, "command": args.command, "error": {"code": "cancelled", "message": "Operación cancelada."}})
        return 130


if __name__ == "__main__":
    sys.exit(main())
