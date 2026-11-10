# Instrucciones para agentes

Este repositorio es una integración de Google Drive basada en `glotlabs/gdrive`.

1. Para cualquier petición sobre Drive o `/GoogleDrive`, lee y sigue `skills/google-drive/SKILL.md`.
2. El adaptador es `python3 scripts/gdrive_skill.py`; no uses una API distinta ni instales librerías innecesarias.
3. Empieza con `doctor`. Usa `setup` solo si falta el binario.
4. Si falta autenticación, pide al usuario que ejecute `account add` en su terminal. Nunca solicites credenciales, tokens o códigos OAuth en el chat.
5. Obtén IDs reales con `list`; no inventes IDs ni afirmes que una operación se completó sin un resultado JSON con `ok: true`.
6. No borres, sobrescribas ni compartas públicamente sin confirmación explícita. `delete` siempre necesita `--yes`.
7. No añadas al Git credenciales, cuentas exportadas, descargas ni el contenido de `~/.config/gdrive3/`.

Para modificar el adaptador, ejecuta `python3 -m unittest discover -s tests -v` y `python3 -m py_compile scripts/gdrive_skill.py scripts/install_skill.py`.
