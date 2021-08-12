*** Keywords ***
Make a Font Test Notebook
    Launch a new JupyterLab Document    Python 3 (ipykernel)
    Add and Run JupyterLab Code Cell
    ...    from IPython.display import Markdown
    ...    display(*[Markdown(f"{'#' * i} Hello world") for i in range(10)])
    Maybe Close JupyterLab Sidebar
