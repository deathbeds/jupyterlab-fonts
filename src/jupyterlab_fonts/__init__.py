""""main importable for jupyterlab-fonts"""

import json
from pathlib import Path

from ._version import __js__, __version__


def _jupyter_labextension_paths():
    here = Path(__file__).parent

    exts = []
    for pkg in here.glob("labextensions/*/*/package.json"):
        exts += [
            dict(
                src=str(pkg.parent.relative_to(here).as_posix()),
                dest=json.loads(pkg.read_text(encoding="utf-8"))["name"],
            )
        ]
    return exts


__all__ = [
    "__js__",
    "__version__",
    "_jupyter_labextension_paths",
]
