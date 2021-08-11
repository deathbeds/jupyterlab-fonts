"""source of truth for jupyterlab-fonts version and metadata"""
import json
from pathlib import Path

HERE = Path(__file__).parent
PKG_JSON = HERE / "labextensions/@deathbeds/jupyterlab-fonts/package.json"

__js__ = json.loads(PKG_JSON.read_text(encoding="utf-8"))

__version__ = __js__["version"]

__all__ = ["__version__", "__js__"]
