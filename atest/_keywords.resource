*** Settings ***
Documentation       Keywords for testing jupyterlab-fonts

Resource            ./_variables.resource
Library             uuid
Library             BuiltIn
Library             OperatingSystem
Library             Collections
Library             JupyterLibrary
Library             shutil


*** Variables ***
${JUPYTERLAB_EXE}       ["jupyter-lab"]
${JSCOV}                ${EMPTY}


*** Keywords ***
Initialize Jupyter Server
    [Documentation]    Set up server with command as defined in atest.py.
    [Arguments]    ${home_dir}
    ${notebook_dir} =    Set Variable    ${home_dir}${/}work
    ${port} =    Get Unused Port
    ${token} =    Generate Random String    64
    ${base url} =    Set Variable    /jl@f/
    @{args} =    Build Custom JupyterLab Args    ${port}    ${token}    ${base url}
    ${rest_args} =    Get Slice From List    ${args}    1
    &{config} =    Create Dictionary
    ...    stdout=${OUTPUT DIR}${/}lab.log
    ...    stderr=STDOUT
    ...    cwd=${notebook_dir}
    ...    env:HOME=${home_dir}
    ...    env:JUPYTER_PREFER_ENV_PATH=0
    ${lab} =    Start New Jupyter Server
    ...    ${args[0]}
    ...    ${port}
    ...    ${base url}
    ...    ${notebook_dir}
    ...    ${token}
    ...    @{rest_args}
    ...    &{config}
    Wait For Jupyter Server To Be Ready    ${lab}
    RETURN    ${lab}

Initialize Fake Home
    ${home_dir} =    Set Variable    ${OUTPUT_DIR}${/}.home
    ${fixtures} =    Normalize Path    atest${/}fixtures
    ${local} =    Set Variable    ${home_dir}${/}.local
    OperatingSystem.Copy File
    ...    ${fixtures}${/}overrides.json
    ...    ${local}${/}share${/}jupyter${/}lab${/}settings${/}overrides.json
    OperatingSystem.Copy File
    ...    ${fixtures}${/}jupyter_config.json
    ...    ${local}${/}etc${/}jupyter${/}jupyter_config.json
    Create Directory    ${home_dir}${/}work
    RETURN    ${home_dir}

Build Custom JupyterLab Args
    [Documentation]    Generate some args
    [Arguments]    ${port}    ${token}    ${base url}
    IF    "%{JUPYTERLAB_CONDA_PREFIX}"
        @{args} =    Set Variable
        ...    %{CONDA_EXE}
        ...    run
        ...    --prefix
        ...    %{JUPYTERLAB_CONDA_PREFIX}
        ...    --no-capture-output
        ...    python
        ...    -m
        ...    jupyter
        ...    lab
    ELSE
        @{args} =    Loads    ${JUPYTERLAB_EXE}
    END
    ${config} =    Normalize Path    ${ROOT}${/}atest${/}fixtures${/}jupyter_config.json
    @{args} =    Set Variable
    ...    @{args}
    ...    --no-browser
    ...    --debug
    ...    --expose-app-in-browser
    ...    --port\=${port}
    ...    --ServerApp.token\=${token}
    ...    --ServerApp.base_url\=${base url}
    ...    --config\=${config}
    Log    ${args}
    RETURN    @{args}

Get GeckoDriver
    IF    "${OS}" == "win-64"
        ${executable_path} =    shutil.which    geckodriver.exe
    ELSE
        ${executable_path} =    shutil.which    geckodriver
    END
    RETURN    ${executable_path}

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
    Set Attempt Screenshot Directory    editor${/}${scope}${/}${kind}${/}${font}
    Change a Font Dropdown    ${scope}    ${kind}    Font    ${font}    0
    IF    "${scope}" == "Global"    Check font license is visible in Editor
    IF    "${kind}" != "UI"
        Change a Font Dropdown    ${scope}    ${kind}    Size    -    0
        FOR    ${size}    IN RANGE    12    20    4
            Change a Font Dropdown    ${scope}    ${kind}    Size    ${size}px    ${size}
            IF    "${scope}" == "Global"    Settings Should Contain    ${font}
        END
    END
    Change a Font Dropdown    ${scope}    ${kind}    Font    -    99

Change a Font Dropdown
    [Documentation]    Update a particular typography value
    [Arguments]    ${scope}    ${kind}    ${aspect}    ${value}    ${idx}=0
    ${sel} =    Set Variable    ${ED} section[title="${kind}"] select[title="${aspect}"]
    Select From List By Label    ${sel}    ${value}
    IF    "${scope}" == "Global"
        Settings Should Contain    ${value}
        IF    "${aspect}" == "Font"
            ${css} =    Execute JavaScript    return document.querySelector(`${MOD_GLOBAL}`).textContent
            IF    "${value}" != "-"
                Should Contain    ${css}    @font-face
                Should Contain    ${css}    font-family: '${value}';
                Should Contain    ${css}    src: url('
            ELSE
                Should Not Contain    ${css}    @font-face
                Should Not Contain    ${css}    font-family:
                Should Not Contain    ${css}    src: url('
            END
        END
    END
    Capture Page Screenshot    ${aspect}_${idx}.png

Check font license is visible in Editor
    [Documentation]    Verify that the licenses are loaded
    Click Element    css:.jp-FontsEditor-field ${BUTTON}
    Wait Until Page Contains Element    css:.jp-LicenseViewer pre    timeout=20s
    Capture Page Screenshot    Font_1_license.png
    Close the License Viewer

Use the Global font editor to ${what} custom fonts
    [Documentation]    Presently, change a checkbox in the font editor
    Set Attempt Screenshot Directory    editor${/}Global${/}${what}
    ${input} =    Set Variable    ${ED}-enable input
    Capture Page Screenshot    00_before.png
    IF    "${what}"=="enable"    Select Checkbox    ${input}
    IF    "${what}"=="disable"    Unselect Checkbox    ${input}
    Capture Page Screenshot    01_after.png

Settings Should Contain
    [Documentation]    Check the settings for a string
    [Arguments]    ${value}
    ${settings} =    Get Editor Content    ${SETTINGS_RAW} ${CM CSS EDITOR}
    IF    "${value}" != '-'    Should Contain    ${settings}    ${value}

Get Editor Content
    [Documentation]    Get CodeMirror content
    [Arguments]    ${sel}
    Update Globals For JupyterLab Version
    ${js} =    Set Variable    return document.querySelector(`${sel}`)${CM JS INSTANCE}
    IF    ${CM VERSION} == 5
        ${js} =    Set Variable    ${js}.getValue()
    ELSE
        ${js} =    Set Variable    ${js}.view.state.doc.toString()
    END
    ${content} =    Execute JavaScript    ${js}
    RETURN    ${content}

Prepare to test a font editor
    [Documentation]    Open a notebook and settings
    Update Globals For JupyterLab Version
    Execute JupyterLab Command    Close All Tabs
    Make a Font Test Notebook

Open Advanced Settings to Validate Fonts
    [Documentation]    use advanced settings to validate changes
    Update Globals For JupyterLab Version
    IF    ${CM VERSION} == 6
        Execute JupyterLab Command    Advanced Settings Editor
    ELSE
        Execute JupyterLab Command    Advanced JSON Settings Editor
    END
    ${settings} =    Set Variable    ${DOCK}//${TAB}//${ICON_SETTINGS}/../..
    ${fonts} =    Set Variable    ${SETTING_ITEM}//${ICON_FONT}
    Wait Until Page Contains Element    ${fonts}
    Click Element    ${fonts}
    Drag And Drop By Offset    ${settings}    0    800
    Click Element    css:.jp-Notebook ${CM CSS EDITOR}

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
    IF    ${cov_json}    Create File    ${JSCOV}${/}${name}.json    ${cov_json}

Reset JupyterLab And Close With Coverage
    [Documentation]    Close JupyterLab after gathering coverage.
    Capture Page Coverage
    Reset JupyterLab And Close

Prepare Menu Test
    Set Attempt Screenshot Directory    menus
    Execute JupyterLab Command    Close All Tabs
    Make a Font Test Notebook

Use the Menu to configure Font
    [Documentation]    Set a font value in the JupyterLab Fonts Menu
    [Arguments]    ${kind}    ${aspect}    ${setting}
    Wait Until Keyword Succeeds    5x    0.25s
    ...    Open With JupyterLab Menu    Settings    Fonts    ${kind}    ${aspect}    ${setting}
    Capture Page Screenshot    ${kind}-${aspect}-${setting}.png
    Capture Page Coverage

Set Attempt Screenshot Directory
    [Documentation]    Set a screenshot directory that includes the attempt
    [Arguments]    ${path}
    Update Globals For JupyterLab Version
    Set Screenshot Directory
    ...    ${OUTPUT_DIR}${/}screenshots${/}${OS.lower()[:2]}_${ATTEMPT}${/}${path}

Set Cell Metadata
    [Documentation]    Use the Property Inspector to update the cell metadata
    [Arguments]    ${metadata}    ${idx}=1    ${screenshot}=${EMPTY}
    Update Globals For JupyterLab Version
    Maybe Open JupyterLab Sidebar    Property Inspector
    Maybe Expand Panel With Title    Advanced Tools
    Maybe Open Cell Metadata JSON
    Click Element    css:${JLAB CSS ACTIVE DOC CELLS}:nth-child(${idx})
    Set CodeMirror Value    ${CSS_LAB_CELL_META_TOOL} ${CM CSS EDITOR}    ${metadata}
    ${commit} =    Set Variable    css:${CSS_LAB_CELL_META_TOOL} ${CSS_LAB_META_COMMIT}
    Wait Until Page Contains Element    ${commit}
    Click Element    ${commit}
    IF    ${screenshot.__len__()}    Capture Page Screenshot    ${screenshot}

Maybe Expand Panel With Title
    [Arguments]    ${label}
    ${els} =    Get WebElements
    ...    xpath:${XP_LAB4_COLLAPSED_PANEL_TITLE}\[contains(., '${label}')]
    IF    not ${els.__len__()}    RETURN
    Click Element    ${els[0]}

Maybe Open Cell Metadata JSON
    [Documentation]    Ensure the Cell Metadata viewer is open.
    ${el} =    Get WebElements    css:${CSS_LAB_CELL_META_JSON_CM_HIDDEN}

    IF    not ${el.__len__()}    RETURN

    Click Element    css:${CSS_LAB_ADVANCED_COLLAPSE}
    Wait Until Page Does Not Contain Element    css:${CSS_LAB_CELL_META_JSON_CM_HIDDEN}

Stylesheet Should Contain
    [Documentation]    Check whether style "stuck",
    [Arguments]    ${text}    ${mod}=${MOD_NOTEBOOK}    ${inverse}=${FALSE}
    ${css} =    Get Element Attribute    css:${SHEET}${mod}    innerHTML
    IF    ${inverse}
        Should Not Contain    ${css}    ${text}
    ELSE
        Should Contain    ${css}    ${text}
    END

Stylesheet Should Not Contain
    [Documentation]    Check whether style "stuck",
    [Arguments]    ${text}    ${mod}=${MOD_NOTEBOOK}
    Stylesheet Should Contain    ${text}    ${mod}    inverse=${TRUE}

Open Notebook in Notebook Tab
    Wait Until Element Is Visible    css:${CSS_LAB4_OPEN_IN_NOTEBOOK}
    Click Element    css:${CSS_LAB4_OPEN_IN_NOTEBOOK}
    ${old} =    Switch Window    NEW
    Wait Until Element Is Visible    xpath://${ICON_FONT}
    Wait Until JupyterLab Kernel Is Idle
    RETURN    ${old}
