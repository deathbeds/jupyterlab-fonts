*** Settings ***
Documentation       Cell-level styling works

Library             JupyterLibrary
Resource            ./_keywords.resource

Suite Setup         Set Attempt Screenshot Directory    cells
Suite Teardown      Reset JupyterLab And Close With Coverage
Test Teardown       Clean Up After Cell Test


*** Variables ***
${NS}               @deathbeds/jupyterlab-fonts
# lab4.0: using true empty {} fails to trigger `modelContentChanged`
${META_EMPTY}       {"tags": [], "@deathbeds/jupyterlab-fonts": {"styles": {}}}
${META_RED}         {"tags":["red"], "${NS}": {"styles": {"background-color": "red !important"}}}
${META_IMPORT}      {"${NS}": {"styles": {"@import": "url('./style.css')"}}}
${RED_TAG}          css:[${DATA_TAGS}=",red,"]
${ID_TAG}           css:[${DATA_CELL_ID}]


*** Test Cases ***
Cell Styling (Lab)
    [Documentation]    Can JupyterLab cells be styled?
    [Tags]    app:lab
    Set Attempt Screenshot Directory    cells${/}lab
    Launch A New JupyterLab Document
    Validate Notebook Cell Styles

Cell Styling (Notebook)
    [Documentation]    Can Jupyter Notebook cells be styled?
    [Tags]    app:nb
    Set Attempt Screenshot Directory    cells${/}nb
    Launch A New JupyterLab Document
    TRY
        ${old} =    Open Notebook in Notebook Tab
        Execute JupyterLab Command    Show Notebook Tools
        Validate Notebook Cell Styles
    FINALLY
        Capture Page Coverage
        Close Window
        Switch Window    ${old}
    END

Importing
    ${nbdir} =    Get Jupyter Directory
    ${nburl} =    Get Jupyter Server URL
    Create File    ${nbdir}${/}style.css    body { background-color: green; }
    Launch A New JupyterLab Document
    Wait Until JupyterLab Kernel Is Idle
    Set Cell Metadata    ${META_IMPORT}    1    10-green.png
    Stylesheet Should Contain    @import url('${nburl}files/./style.css')
    Capture Page Screenshot    11-end.png


*** Keywords ***
Clean Up After Cell Test
    Execute JupyterLab Command    Close All Tabs
    ${nbdir} =    Get Jupyter Directory
    Remove File    ${nbdir}${/}Untitled.ipynb

Validate Notebook Cell Styles
    Wait Until JupyterLab Kernel Is Idle
    Stylesheet Should Not Contain    background-color: red
    Wait Until Page Contains Element    ${ID_TAG}
    Wait Until Page Does Not Contain Element    ${RED_TAG}
    Set Cell Metadata    ${META_RED}    1    00-red.png
    Wait Until Page Contains Element    ${RED_TAG}
    Stylesheet Should Contain    background-color: red
    Set Cell Metadata    ${META_EMPTY}    1    01-empty.png
    Wait Until Page Does Not Contain Element    ${RED_TAG}
    Capture Page Screenshot    02-tag-cleaned.png
    Stylesheet Should Not Contain    background-color: red
    Capture Page Screenshot    03-end.png
