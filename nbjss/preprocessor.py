import os
import json
from nbconvert.preprocessors.base import Preprocessor

from .constants import METADATA_KEY

here = os.path.dirname(__file__)
static = os.path.join(here, "static")
nbjss_js = os.path.join(static, "nbjss.js")
nbjss_jss = os.path.join(static, "nbjss.jss.json")


class JSSHeaderPreprocessor(Preprocessor):
    """ Adds a bunch of nasty CSS and JavaScript to make fonts pretty.
    """

    def preprocess(self, nb, resources):
        jss = nb.metadata.get(METADATA_KEY)
        if jss is not None:
            inlining = resources.setdefault("inlining", {})
            inlining.setdefault("css", "")

            with open(nbjss_jss) as jss_fp:
                with open(nbjss_js) as js_fp:
                    not_css = """</style>
                    <script>%s</script>
                    <script>
                        ;(function(){
                            console.log(nbjss);
                            nbjss.createStyleSheet(%s).attach();
                            nbjss.createStyleSheet(%s).attach();
                        }).call(this);
                    </script>
                    <style>/* this is not style */""" % (
                        js_fp.read(),
                        json.dumps({"@global": json.load(jss_fp)}),
                        json.dumps(
                            {
                                "@global": jss.get("styles", {}),
                                "@font-face": sum(jss.get("fonts", {}).values(), []),
                            },
                            indent=2,
                        ),
                    )
            inlining["css"] += [not_css]

        return nb, resources
