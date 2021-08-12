*** Settings ***
Documentation     The font editor allows changing fonts in notebooks
Library           JupyterLibrary
Library           BuiltIn
Library           OperatingSystem
Resource          ./_keywords.robot

*** Variables ***
${ED}             css:.jp-FontsEditor
${DOCK}           //div[@id='jp-main-dock-panel']
${TAB}            li[contains(@class, 'lm-TabBar-tab')]
${ICON_FONT}      *[@data-icon = 'fonts:fonts']
${ICON_LICENSE}    *[@data-icon = 'fonts:license']
${ICON_SETTINGS}    *[@data-icon = 'ui-components:settings']
${ICON_NOTEBOOK}    *[@data-icon = 'ui-components:notebook']
${ICON_CLOSE}     div[contains(@class, 'lm-TabBar-tabCloseIcon')]
${BUTTON}         .jp-FontsEditor-button
${SETTING_ITEM}    //div[contains(@class, 'jp-PluginList')]//li
${SETTINGS_RAW_CM}    .jp-SettingsRawEditor-user .CodeMirror

*** Test Cases ***
Global Font Editor
    [Documentation]    Customize Global fonts with the Font Editor
    [Setup]    Open the Global Font Editor
    [Template]    Use the font editor to configure fonts
    Global    Code    Anonymous Pro Bold
    Global    Code    Anonymous Pro Regular
    Global    Code    DejaVu Sans Mono
    Global    Code    DejaVu Sans Mono Bold
    Global    Code    Fira Code Bold
    Global    Code    Fira Code Light
    Global    Code    Fira Code Medium
    Global    Code    Fira Code Regular
    Global    Content    Anonymous Pro Bold
    Global    Content    Anonymous Pro Regular
    Global    Content    DejaVu Sans Mono
    Global    Content    DejaVu Sans Mono Bold
    Global    Content    Fira Code Bold
    Global    Content    Fira Code Light
    Global    Content    Fira Code Medium
    Global    Content    Fira Code Regular
    [Teardown]    Close the Font Editor    Global

Notebook Font Editor
    [Documentation]    Customize Notebook fonts with the Font Editor
    [Setup]    Open the Notebook Font Editor
    [Template]    Use the font editor to configure fonts
    Notebook    Code    -
    Notebook    Code    Anonymous Pro Bold
    Notebook    Code    Anonymous Pro Regular
    Notebook    Code    DejaVu Sans Mono
    Notebook    Code    DejaVu Sans Mono Bold
    Notebook    Code    Fira Code Bold
    Notebook    Code    Fira Code Light
    Notebook    Code    Fira Code Medium
    Notebook    Code    Fira Code Regular
    Notebook    Content    -
    Notebook    Content    Anonymous Pro Bold
    Notebook    Content    Anonymous Pro Regular
    Notebook    Content    DejaVu Sans Mono
    Notebook    Content    DejaVu Sans Mono Bold
    Notebook    Content    Fira Code Bold
    Notebook    Content    Fira Code Light
    Notebook    Content    Fira Code Medium
    Notebook    Content    Fira Code Regular
    [Teardown]    Close the Font Editor    Untitled

Global Enable/Disable
    [Documentation]    Test enabling and disabling custom fonts
    [Setup]    Open the Global Font Editor
    Set Screenshot Directory    ${OUTPUT_DIR}/global_editor/
    Use the Global Font Editor to disable custom fonts
    Use the Global Font Editor to enable custom fonts
    [Teardown]    Close the Font Editor    Global

*** Keywords ***
Prepare to test a font editor
    [Documentation]    Open a notebook and settings
    Execute JupyterLab Command    Close All Tabs
    Make a Font Test Notebook

Open Advanced Settings to Validate Fonts
    [Documentation]    use advanced settings to validate changes
    Open With JupyterLab Menu    Settings    Advanced Settings Editor
    ${settings} =    Set Variable    ${DOCK}//${TAB}//${ICON_SETTINGS}/../..
    ${fonts} =    Set Variable    ${SETTING_ITEM}//${ICON_FONT}
    Wait Until Page Contains Element    ${fonts}
    Click Element    ${fonts}
    Drag And Drop By Offset    ${settings}    0    600
    Click Element    css:.jp-Notebook .CodeMirror

Open the Global Font Editor
    [Documentation]    Use the JupyterLab Menu to open the global font editor
    Prepare to test a font editor
    Open With JupyterLab Menu    Settings    Fonts    Global Fonts...
    Open Advanced Settings to Validate Fonts

Open the Notebook Font Editor
    [Documentation]    Use the Notebook button bar to open the notebook font editor
    Prepare to test a font editor
    Click Element    css:.jp-Toolbar-item [data-icon\='fonts:fonts']
    Open Advanced Settings to Validate Fonts

Close the Font Editor
    [Arguments]    ${kind}=Global
    [Documentation]    Close the Notebook Font Editor by closing the tab
    Close JupyterLab Dock Panel Tab    ${kind}
    Execute JupyterLab Command    Close All Tabs
    ${dir} =    Get Jupyter Directory
    Remove File    ${dir}${/}Untitled.ipynb

Close the License Viewer
    [Documentation]    Close the Font License Viewer by closing the tab
    Click Element    ${DOCK}//${TAB}//${ICON_LICENSE}/../../${ICON_CLOSE}

Use the font editor to configure fonts
    [Arguments]    ${scope}    ${kind}    ${font}
    [Documentation]    Presently, change a dropdown in the font editor
    Set Screenshot Directory    ${OUTPUT_DIR}/editor/${scope}/${kind}/${font}
    Change a Font Dropdown    ${scope}    ${kind}    Font    ${font}    0
    Run Keyword If    "${scope}" == "Global"    Check font license is visible in Editor
    Change a Font Dropdown    ${scope}    ${kind}    Size    -    0
    FOR    ${size}    IN RANGE    12    20    4
        Change a Font Dropdown    ${scope}    ${kind}    Size    ${size}px    ${size}
        Run Keyword If    "${scope}" == "Global"    Settings Should Contain    ${font}
    END
    Change a Font Dropdown    ${scope}    ${kind}    Font    -    99

Change a Font Dropdown
    [Arguments]    ${scope}    ${kind}    ${aspect}    ${value}    ${idx}=0
    [Documentation]    Update a particular typography value
    ${sel} =    Set Variable    ${ED} section[title="${kind}"] select[title="${aspect}"]
    Select From List By Label    ${sel}    ${value}
    Capture Page Screenshot    ${aspect}_${idx}.png
    Run Keyword If    "${scope}" == "Global"    Settings Should Contain    ${value}

Check font license is visible in Editor
    [Documentation]    Verify that the licenses are loaded
    Click Element    css:.jp-FontsEditor-field ${BUTTON}
    Wait Until Page Contains Element    css:.jp-LicenseViewer pre    timeout=20s
    Capture Page Screenshot    Font_1_license.png
    Close the License Viewer

Use the Global font editor to ${what} custom fonts
    [Documentation]    Presently, change a checkbox in the font editor
    Set Screenshot Directory    ${OUTPUT_DIR}/editor/Global/${what}
    ${input} =    Set Variable    ${ED}-enable input
    Capture Page Screenshot    00_before.png
    Run Keyword If    "${what}"=="enable"    Select Checkbox    ${input}
    Run Keyword If    "${what}"=="disable"    Unselect Checkbox    ${input}
    Capture Page Screenshot    01_after.png

Settings Should Contain
    [Arguments]    ${value}
    [Documentation]    Check the settings for a string
    ${settings} =    Get Editor Content    ${SETTINGS_RAW_CM}
    Run Keyword If    "${value}" != '-'    Should Contain    ${settings}    ${value}

Get Editor Content
    [Arguments]    ${sel}
    [Documentation]    Get CodeMirror content
    ${js} =    Set Variable    return document.querySelector(`${sel}`).CodeMirror.getValue()
    ${content}    Execute JavaScript    ${js}
    [Return]    ${content}
