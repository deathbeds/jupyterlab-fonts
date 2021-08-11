# pylint: disable=protected-access
import importlib
import sys
from pathlib import Path

from jupyterlab.labextensions import LabExtensionApp
from jupyterlab import federated_labextensions

HERE = Path(__file__).parent
ROOT = HERE.parent
NODE_MODULES = ROOT / "node_modules"
BUILDER = NODE_MODULES / "@jupyterlab" / "builder" / "lib" / "build-labextension.js"


def _get_labextension_metadata(module):
    m = importlib.import_module(module)
    return m, m._jupyter_labextension_paths()


federated_labextensions._get_labextension_metadata = _get_labextension_metadata

main = LabExtensionApp.launch_instance

if __name__ == "__main__":
    sys.exit(main())
