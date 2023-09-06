"""A custom `jupyter-labextension` to enable the semi-weird directory layout."""
import importlib
import sys
from pathlib import Path

from jupyterlab import federated_labextensions
from jupyterlab.labextensions import LabExtensionApp

HERE = Path(__file__).parent
ROOT = HERE.parent
NODE_MODULES = ROOT / "node_modules"
BUILDER = NODE_MODULES / "@jupyterlab/builder/lib/build-labextension.js"


def _get_labextension_metadata(module):
    m = importlib.import_module(module)
    return m, m._jupyter_labextension_paths()


federated_labextensions._get_labextension_metadata = _get_labextension_metadata
federated_labextensions._ensure_builder = lambda *_: str(BUILDER)

main = LabExtensionApp.launch_instance

if __name__ == "__main__":
    sys.exit(main())
