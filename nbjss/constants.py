import enum


METADATA_KEY = "@deathbeds/jupyterlab-fonts"
ROOT = ":root"


class StaticStrategy(enum.Enum):
    # TODO: implement other strategies
    inline_js = "inline_js"
    inline_css = "inline_css"
    relative = "relative"
    cdn = "cdn"
