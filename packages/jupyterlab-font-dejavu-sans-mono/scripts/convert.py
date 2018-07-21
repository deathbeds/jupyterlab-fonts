#!/usr/bin/env bash
from pathlib import Path
from fontTools.ttLib import TTFont

in_path = Path("../../node_modules/dejavu-fonts-ttf/ttf")
out_path = Path("style") / "fonts"

out_path.mkdir(exist_ok=True, parents=True)

base = "DejaVuSansMono"
extension = "ttf"
variants = ["", "-Bold"]


for variant in variants:
    ttf = in_path / f"{base}{variant}.{extension}"
    woff2_path = out_path / ttf.with_suffix(".woff2").name

    if woff2_path.exists():
        continue

    font = TTFont(str(ttf))
    font.flavor = "woff2"
    font.save(str(out_path / ttf.with_suffix(".woff2").name))
