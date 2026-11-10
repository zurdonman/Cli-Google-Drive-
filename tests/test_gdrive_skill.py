import argparse
import io
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

from scripts import gdrive_skill as skill


class GdriveSkillTests(unittest.TestCase):
    def test_parse_tabular_keeps_empty_columns(self):
        rows = skill.parse_tabular("abc\tDocumento\tregular\t\t2026-01-01\n", ["id", "name", "type", "size", "created"])
        self.assertEqual(rows[0]["id"], "abc")
        self.assertEqual(rows[0]["size"], "")
        self.assertEqual(rows[0]["name"], "Documento")

    @patch.object(skill, "checked", return_value=("drive-id", ""))
    @patch.object(skill, "find_binary", return_value="/bin/gdrive")
    def test_upload_builds_expected_arguments(self, _binary, checked):
        with tempfile.NamedTemporaryFile() as source:
            args = argparse.Namespace(path=Path(source.name), parent=["folder"], mime="text/plain", recursive=False, chunk_size=8)
            response = skill.execute(argparse.Namespace(command="upload", **vars(args)))
        self.assertTrue(response["ok"])
        self.assertEqual(response["data"]["id"], "drive-id")
        command = checked.call_args.args[0]
        self.assertIn("--print-only-id", command)
        self.assertEqual(command[command.index("--parent") + 1], "folder")
        self.assertEqual(command[command.index("--chunk-size") + 1], "8")

    @patch.object(skill, "checked", return_value=("new-id", ""))
    def test_create_uploads_requested_name_and_content(self, checked):
        args = argparse.Namespace(command="create", name="nota.txt", content="hola", parent=None, mime="text/plain")
        response = skill.execute(args)
        command = checked.call_args.args[0]
        local_path = Path(command[2])
        self.assertEqual(local_path.name, "nota.txt")
        self.assertEqual(response["data"], {"id": "new-id", "name": "nota.txt"})

    def test_create_rejects_paths(self):
        args = argparse.Namespace(command="create", name="../secret", content="no", parent=None, mime="text/plain")
        with self.assertRaises(skill.SkillError) as error:
            skill.execute(args)
        self.assertEqual(error.exception.code, "invalid_name")

    def test_delete_requires_explicit_confirmation(self):
        with self.assertRaises(skill.SkillError) as error:
            skill.execute(argparse.Namespace(command="delete", file_id="abc", recursive=False, yes=False))
        self.assertEqual(error.exception.code, "confirmation_required")

    def test_share_validates_email(self):
        args = argparse.Namespace(command="share", file_id="abc", role="reader", type="user", email=None, domain=None, discoverable=False)
        with self.assertRaises(skill.SkillError) as error:
            skill.execute(args)
        self.assertEqual(error.exception.code, "invalid_argument")

    def test_archive_traversal_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / "bad.tar.gz"
            payload = Path(directory) / "payload"
            payload.write_text("bad")
            with tarfile.open(archive, "w:gz") as bundle:
                bundle.add(payload, arcname="../gdrive")
            with self.assertRaises(skill.SkillError) as error:
                skill.extract_binary(archive, Path(directory) / "out", False)
            self.assertEqual(error.exception.code, "unsafe_archive")

    def test_list_rejects_invalid_limit(self):
        args = argparse.Namespace(command="list", max=0, parent=None, drive=None, query=None, order_by=None)
        with self.assertRaises(skill.SkillError):
            skill.execute(args)


if __name__ == "__main__":
    unittest.main()
