"""Single source of truth for jupyterlab_fonts version."""
import sys
from importlib.metadata import version
from pathlib import Path

HERE = Path(__file__).parent
_D = HERE.parent / "_d"

__prefix__ = _D if _D.exists() and _D.parent.name == "src" else Path(sys.prefix)

__pkg__ = {
    f"{p.parent.parent.name}/{p.parent.name}": p
    for p in __prefix__.glob(
        "share/jupyter/labextensions/@deathbeds/jupyterlab-font*/package.json",
    )
}

__version__ = version("jupyterlab_fonts")
