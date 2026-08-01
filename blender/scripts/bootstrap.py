"""Ubaci scripts/ u sys.path i ocisti kes modula projekta.

Python kesira module u sys.modules, pa druga izmena fajla ne bi imala efekta.
Zato se svi projektni moduli izbacuju iz kesa pre re-importa.

Upotreba iz execute_blender_code:

    exec(open(r"<repo>/blender/scripts/bootstrap.py").read())
    import lib.paths, lib.sweep
"""

import sys
import os

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__)) \
    if "__file__" in globals() else \
    r"C:\Users\admin\Desktop\Web Dev Projects\enigma-digital\blender\scripts"

PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)

if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

# izbaci projektne module iz kesa da izmene fajlova odmah vaze
for _name in [m for m in sys.modules
              if m in ("lib", "ops") or m.startswith(("lib.", "ops."))
              or m in ("paths", "path", "pathcheck", "sweep")]:
    del sys.modules[_name]

# NE "del _name" bez uslova: ako je lista prazna, _name nikad nije definisan
# i bootstrap puca sa NameError na drugom pokretanju.
if "_name" in dir():
    del _name
