*** Keywords ***
Make a Font Test Notebook
    ${kernel} =    Get Element Attribute    css:.jp-LauncherCard-label[title^='Python 3']    title
    Launch a new JupyterLab Document    ${kernel}
    Add and Run JupyterLab Code Cell
    ...    from IPython.display import Markdown
    ...    display(*[Markdown(f"{'#' * i} Hello world") for i in range(10)])
    Maybe Close JupyterLab Sidebar
