*** Settings ***
Documentation       Keywords for testing jupyterlab-fonts

Resource            ./_variables.resource
Library             uuid
Library             BuiltIn
Library             OperatingSystem
Library             JupyterLibrary


*** Keywords ***
Make a Font Test Notebook
    ${kernel} =    Get Element Attribute    css:.jp-LauncherCard-label[title^='Python 3']    title
    Launch a new JupyterLab Document    ${kernel}
    Add and Run JupyterLab Code Cell
    ...    from IPython.display import Markdown
    ...    display(*[Markdown(f"{'#' * i} Hello world") for i in range(6)])
    Maybe Close JupyterLab Sidebar

Close the Font Editor
    [Documentation]    Close the Notebook Font Editor by closing the tab
    [Arguments]    ${kind}=Global
    Close JupyterLab Dock Panel Tab    ${kind}
    Execute JupyterLab Command    Close All Tabs
    ${dir} =    Get Jupyter Directory
    Remove File    ${dir}${/}Untitled.ipynb
    Capture Page Coverage

Close the License Viewer
    [Documentation]    Close the Font License Viewer by closing the tab
    Click Element    ${DOCK}//${TAB}//${ICON_LICENSE}/../../${ICON_CLOSE}

Use the font editor to configure fonts
    [Documentation]    Presently, change a dropdown in the font editor
    [Arguments]    ${scope}    ${kind}    ${font}
    Set Screenshot Directory    ${OUTPUT_DIR}${/}editor${/}${scope}${/}${kind}${/}${font}
    Change a Font Dropdown    ${scope}    ${kind}    Font    ${font}    0
    IF    "${scope}" == "Global"    Check font license is visible in Editor
    Change a Font Dropdown    ${scope}    ${kind}    Size    -    0
    FOR    ${size}    IN RANGE    12    20    4
        Change a Font Dropdown    ${scope}    ${kind}    Size    ${size}px    ${size}
        IF    "${scope}" == "Global"    Settings Should Contain    ${font}
    END
    Change a Font Dropdown    ${scope}    ${kind}    Font    -    99

Change a Font Dropdown
    [Documentation]    Update a particular typography value
    [Arguments]    ${scope}    ${kind}    ${aspect}    ${value}    ${idx}=0
    ${sel} =    Set Variable    ${ED} section[title="${kind}"] select[title="${aspect}"]
    Select From List By Label    ${sel}    ${value}
    Capture Page Screenshot    ${aspect}_${idx}.png
    IF    "${scope}" == "Global"    Settings Should Contain    ${value}

Check font license is visible in Editor
    [Documentation]    Verify that the licenses are loaded
    Click Element    css:.jp-FontsEditor-field ${BUTTON}
    Wait Until Page Contains Element    css:.jp-LicenseViewer pre    timeout=20s
    Capture Page Screenshot    Font_1_license.png
    Close the License Viewer

Use the Global font editor to ${what} custom fonts
    [Documentation]    Presently, change a checkbox in the font editor
    Set Screenshot Directory    ${OUTPUT_DIR}${/}editor${/}Global${/}${what}
    ${input} =    Set Variable    ${ED}-enable input
    Capture Page Screenshot    00_before.png
    IF    "${what}"=="enable"    Select Checkbox    ${input}
    IF    "${what}"=="disable"    Unselect Checkbox    ${input}
    Capture Page Screenshot    01_after.png

Settings Should Contain
    [Documentation]    Check the settings for a string
    [Arguments]    ${value}
    ${settings} =    Get Editor Content    ${SETTINGS_RAW_CM}
    IF    "${value}" != '-'    Should Contain    ${settings}    ${value}

Get Editor Content
    [Documentation]    Get CodeMirror content
    [Arguments]    ${sel}
    ${js} =    Set Variable    return document.querySelector(`${sel}`).CodeMirror.getValue()
    ${content} =    Execute JavaScript    ${js}
    RETURN    ${content}

Prepare to test a font editor
    [Documentation]    Open a notebook and settings
    Execute JupyterLab Command    Close All Tabs
    Make a Font Test Notebook

Open Advanced Settings to Validate Fonts
    [Documentation]    use advanced settings to validate changes
    Execute JupyterLab Command    Advanced JSON Settings Editor
    ${settings} =    Set Variable    ${DOCK}//${TAB}//${ICON_SETTINGS}/../..
    ${fonts} =    Set Variable    ${SETTING_ITEM}//${ICON_FONT}
    Wait Until Page Contains Element    ${fonts}
    Click Element    ${fonts}
    Drag And Drop By Offset    ${settings}    0    600
    Click Element    css:.jp-Notebook .CodeMirror

Open the Notebook Font Editor
    [Documentation]    Use the Notebook button bar to open the notebook font editor
    Prepare to test a font editor
    Click Element    css:.jp-Toolbar-item [data-icon\='fonts:fonts']
    Open Advanced Settings to Validate Fonts

Open the Global Font Editor
    [Documentation]    Use the JupyterLab Menu to open the global font editor
    Prepare to test a font editor
    Open With JupyterLab Menu    Settings    Fonts    Global Fonts...
    Open Advanced Settings to Validate Fonts

Get Next Coverage File
    [Documentation]    Get a random filename.
    ${uuid} =    UUID1
    RETURN    ${uuid.__str__()}

Capture Page Coverage
    [Documentation]    Fetch coverage data from the browser.
    [Arguments]    ${name}=${EMPTY}
    IF    not '''${name}'''
        ${name} =    Get Next Coverage File
    END
    ${cov_json} =    Execute Javascript
    ...    return window.__coverage__ && JSON.stringify(window.__coverage__, null, 2)
    IF    ${cov_json}
        Create File    ${ROBOCOV}${/}${name}.json    ${cov_json}
    END

Reset JupyterLab And Close With Coverage
    [Documentation]    Close JupyterLab after gathering coverage.
    Capture Page Coverage
    Reset JupyterLab And Close

Prepare Menu Test
    Set Screenshot Directory    ${OUTPUT_DIR}${/}menus
    Execute JupyterLab Command    Close All Tabs
    Make a Font Test Notebook

Use the Menu to configure Font
    [Documentation]    Set a font value in the JupyterLab Fonts Menu
    [Arguments]    ${kind}    ${aspect}    ${setting}
    Wait Until Keyword Succeeds    5x    0.25s
    ...    Open With JupyterLab Menu    Settings    Fonts    ${kind}    ${aspect}    ${setting}
    Capture Page Screenshot    ${kind}-${aspect}-${setting}.png
    Capture Page Coverage
