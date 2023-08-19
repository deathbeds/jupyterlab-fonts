"""Single source of truth for jupyterlab_fonts version."""
import sys
from importlib.metadata import version
from pathlib import Path

HERE = Path(__file__).parent
_D = HERE / "_d"
__ext__ = "@deathbeds/jupyterlab-starters"

__prefix__ = _D if _D.exists() else Path(sys.prefix)

__pkg__ = {
    f"{p.parent.parent.name}/{p.parent.name}": p
    for p in __prefix__.glob("*/*/package.json]")
}

__version__ = version("jupyterlab_fonts")
