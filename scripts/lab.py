""" run lab with build disabled
"""
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import json

CONF = {
    "LabApp": {
        "tornado_settings": {
            "page_config_data": {
                "buildCheck": False,
                "buildAvailable": False
            }
        }
    }
}


def lab():
    with TemporaryDirectory() as td:
        tdp = Path(td)
        conf = tdp / "jupyter_notebook_config.json"
        conf.write_text(json.dumps(CONF))
        subprocess.check_call(["jupyter", "lab", "--no-browser", "--debug", "--config", conf])


if __name__ == "__main__":
    lab()
