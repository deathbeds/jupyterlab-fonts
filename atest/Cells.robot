*** Settings ***
Documentation       Cell-level styling works

Library             JupyterLibrary
Resource            ./_keywords.resource

Suite Setup         Set Attempt Screenshot Directory    cells
Suite Teardown      Reset JupyterLab And Close With Coverage


*** Variables ***
${NS}               @deathbeds/jupyterlab-fonts
${META_EMPTY}       {}
${META_RED}         {"tags":["red"], "${NS}": {"styles": {"background-color": "red"}}}
${META_IMPORT}      {"${NS}": {"styles": {"@import": "url('./style.css')"}}}
${RED_TAG}          css:[${DATA_TAGS}=",red,"]
${ID_TAG}           css:[${DATA_CELL_ID}]


*** Test Cases ***
Cell Styling
    Launch A New JupyterLab Document
    Wait Until JupyterLab Kernel Is Idle
    Stylesheet Should Not Contain    background-color: red
    Wait Until Page Contains Element    ${ID_TAG}
    Wait Until Page Does Not Contain Element    ${RED_TAG}
    Set Cell Metadata    ${META_RED}    1    00-red.png
    Wait Until Page Contains Element    ${RED_TAG}
    Stylesheet Should Contain    background-color: red
    Set Cell Metadata    ${META_EMPTY}    1    01-empty.png
    Wait Until Page Does Not Contain Element    ${RED_TAG}
    Stylesheet Should Not Contain    background-color: red
    Capture Page Screenshot    02-end.png

Importing
    ${nbdir} =    Get Jupyter Directory
    ${nburl} =    Get Jupyter Server URL
    Create File    ${nbdir}${/}style.css    body { background-color: green; }
    Launch A New JupyterLab Document
    Wait Until JupyterLab Kernel Is Idle
    Set Cell Metadata    ${META_IMPORT}    1    10-red.png
    Stylesheet Should Contain    @import url('${nburl}/files/./style.css')
    Capture Page Screenshot    11-end.png
