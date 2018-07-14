import os
import json


from traitlets import UseEnum

from nbconvert.preprocessors.base import Preprocessor

from .constants import METADATA_KEY, StaticStrategy

here = os.path.dirname(__file__)
static = os.path.join(here, "static")
nbjss_js = os.path.join(static, "nbjss.js")
nbjss_jss = os.path.join(static, "nbjss.jss.json")


class JSSHeaderPreprocessor(Preprocessor):
    """ Adds a bunch of nasty CSS and JavaScript to make fonts pretty.
    """

    static_strategy = UseEnum(
        StaticStrategy,
        default_value=StaticStrategy.inline_js,
        config=True,
        help="A strategy for applying style from JSS.. only `inline_js` supported",
    )

    def preprocess(self, nb, resources):
        jss = nb.metadata.get(METADATA_KEY)

        if jss is None:
            return
        inlining = resources.setdefault("inlining", {})
        inlining.setdefault("css", "")

        css = None

        if self.static_strategy == StaticStrategy.inline_js:
            css = self.strategy_inline_js(jss, resources)
        else:
            raise NotImplementedError(
                "Sorry, {} is not yet supported for static_strategy".format(
                    self.static_strategy
                )
            )

        print(len(inlining["css"]))
        if css is not None:
            inlining["css"] += [css]
        print(len(inlining["css"]))

        return nb, resources

    @property
    def nbjss_jss_json(self):
        with open(nbjss_jss) as fp:
            return json.load(fp)

    @property
    def nbjss_js(self):
        with open(nbjss_js) as fp:
            return fp.read()

    def strategy_inline_js(self, jss, resources):
        """ Embed
        """
        css = """</style>
        <script>%s</script>
        <script>
            ;(function(){
                console.log(nbjss);
                nbjss.createStyleSheet(%s).attach();
                nbjss.createStyleSheet(%s).attach();
            }).call(this);
        </script>
        <style>/* this is not style */""" % (
            self.nbjss_js,
            json.dumps({"@global": self.nbjss_jss_json}),
            json.dumps(
                {
                    "@global": jss.get("styles", {}),
                    "@font-face": sum(jss.get("fonts", {}).values(), []),
                },
                indent=2,
            ),
        )
        return css
