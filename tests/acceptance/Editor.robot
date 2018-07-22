*** Settings ***
Documentation     The font editor performs allows changing fonts in notebooks
Suite Setup       Prepare for testing fonts
Suite Teardown    Clean Up JupyterLab
Library           SeleniumLibrary
Library           BuiltIn
Resource          ../resources/Browser.robot
Resource          ../resources/Lab.robot
Resource          ../resources/Notebook.robot

*** Variables ***
${ED}             css:.jp-FontsEditor
${TAB}            li[contains(@class, 'p-TabBar-tab')]
${ICON_FONT}      div[contains(@class, 'jp-FontsIcon')]
${ICON_LICENSE}    div[contains(@class, 'jp-LicenseIcon')]
${ICON_CLOSE}     div[contains(@class, 'p-TabBar-tabCloseIcon')]

*** Test Cases ***
Global Font Editor
    [Documentation]    Customize Global fonts with the Font Editor
    [Setup]    Open the Global Font Editor
    [Template]    Use the font editor to configure fonts
    Global    Code    Font    -
    Global    Code    Font    Anonymous Pro Bold
    Global    Code    Font    Anonymous Pro Regular
    Global    Code    Font    DejaVu Sans Mono
    Global    Code    Font    DejaVu Sans Mono Bold
    Global    Code    Font    Fira Code Bold
    Global    Code    Font    Fira Code Light
    Global    Code    Font    Fira Code Medium
    Global    Code    Font    Fira Code Regular
    Global    Code    Font    -
    Global    Code    Line Height    -
    Global    Code    Line Height    2
    Global    Code    Line Height    -
    Global    Code    Size    -
    Global    Code    Size    20px
    Global    Code    Size    -
    [Teardown]    Close the Font Editor

Notebook Font Editor
    [Documentation]    Customize Notebook fonts with the Font Editor
    [Setup]    Open the Notebook Font Editor
    [Template]    Use the font editor to configure fonts
    Notebook    Code    Font    -
    Notebook    Code    Font    Anonymous Pro Bold
    Notebook    Code    Font    Anonymous Pro Regular
    Notebook    Code    Font    DejaVu Sans Mono
    Notebook    Code    Font    DejaVu Sans Mono Bold
    Notebook    Code    Font    Fira Code Bold
    Notebook    Code    Font    Fira Code Light
    Notebook    Code    Font    Fira Code Medium
    Notebook    Code    Font    Fira Code Regular
    Notebook    Code    Font    -
    Notebook    Code    Line Height    -
    Notebook    Code    Line Height    2
    Notebook    Code    Line Height    -
    Notebook    Code    Size    -
    Notebook    Code    Size    20px
    Notebook    Code    Size    -
    [Teardown]    Close the Font Editor

Global Enable/Disable
    [Documentation]    Test enabling and disabling custom fonts
    [Setup]    Open the Global Font Editor
    Set Screenshot Directory    ${OUTPUT_DIR}/global_editor/
    Use the Global Font Editor to disable custom fonts
    Use the Global Font Editor to enable custom fonts
    [Teardown]    Close the Font Editor

License Embedding
    [Documentation]    Ensure Licenses are embedded with the Font Editor
    [Setup]    Open the Notebook Font Editor
    [Template]    Check font license is embedded in Notebook
    Anonymous Pro Bold
    Anonymous Pro Regular
    DejaVu Sans Mono
    DejaVu Sans Mono Bold
    Fira Code Bold
    Fira Code Light
    Fira Code Medium
    Fira Code Regular
    [Teardown]    Close the Font Editor

*** Keywords ***
Open the Global Font Editor
    [Documentation]    Use the JupyterLab Menu to open the global font editor
    Click JupyterLab Menu    Settings
    Click JupyterLab Menu Item    Fonts
    Click JupyterLab Menu Item    Global Fonts...

Open the Notebook Font Editor
    [Documentation]    Use the Notebook button bar to open the notebook font editor
    Click Element    css:.jp-Toolbar-item.jp-FontsIcon

Close the Font Editor
    [Documentation]    Close the Notebook Font Editor by closing the tab
    Click Element    ${DOCK}//${TAB}/${ICON_FONT}/../${ICON_CLOSE}

Close the License Viewer
    [Documentation]    Close the Font License Viewer by closing the tab
    Click Element    ${DOCK}//${TAB}/${ICON_LICENSE}/../${ICON_CLOSE}

Use the font editor to configure fonts
    [Arguments]    ${scope}    ${kind}    ${aspect}    ${value}
    [Documentation]    Presently, change a dropdown in the font editor
    Set Screenshot Directory    ${OUTPUT_DIR}/editor/${scope}/${kind}/${aspect}/${value}
    ${sel} =    Set Variable    ${ED} section[title="${kind}"] select[title="${aspect}"]
    Capture Page Screenshot    00_before.png
    Select From List By Label    ${sel}    ${value}
    Capture Page Screenshot    01_after.png

Check font license is embedded in Notebook
    [Arguments]    ${value}
    [Documentation]    Verify that the licenses are loaded
    Use the font editor to configure fonts    Notebook    Code    Font    ${value}
    Click Element    css:.jp-FontsEditor-field button
    Sleep    1s
    Set Screenshot Directory    ${OUTPUT_DIR}/license/${value}
    Capture Page Screenshot    02_license.png
    Close the License Viewer

Use the Global font editor to ${what} custom fonts
    [Documentation]    Presently, change a checkbox in the font editor
    Set Screenshot Directory    ${OUTPUT_DIR}/editor/Global/${what}
    ${input} =    Set Variable    ${ED}-enable input
    Capture Page Screenshot    00_before.png
    Run Keyword If    "${what}"=="enable"    Select Checkbox    ${input}
    Run Keyword If    "${what}"=="disable"    Unselect Checkbox    ${input}
    Capture Page Screenshot    01_after.png
