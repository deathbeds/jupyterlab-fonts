*** Settings ***
Library           Process
Library           BuiltIn
Library           SeleniumLibrary
Library           OperatingSystem

*** Variables ***
${CELL_CSS}       .jp-Notebook .jp-Cell:last-of-type .jp-InputArea-editor .CodeMirror
${TOKEN}          hopelesslyinsecure
${LAB_CMD}        jupyter-lab --no-browser --debug --NotebookApp.token=${TOKEN} --port 18888
${LAB_URL}        http://localhost:18888/lab?token=${TOKEN}&reset
${SPLASH_ID}      jupyterlab-splash
${SPINNER}        css:.jp-Spinner
${CMD_PAL_CSS}    css:.jp-mod-left li[title^="Commands"] div
${CMD_PAL_INPUT}    css:.lm-CommandPalette-input
${CMD_PAL_ITEM}    css:.lm-CommandPalette-item
${TOP}            //div[@id='jp-top-panel']
${BAR_ITEM}       //div[contains(@class, 'lm-MenuBar-itemLabel')]
${CARD}           //div[contains(@class, 'jp-LauncherCard')]
${DOCK}           //div[@id='jp-main-dock-panel']

*** Keywords ***
Prepare for testing fonts
    [Documentation]    Do some normal stuff that might use fonts
    Start Jupyterlab
    ${browser}=    Get Environment Variable    BROWSER    ${BROWSER}
    Open Browser    about:blank    ${browser}
    Set Window Size    1920    1080
    Set tags    ${browser}

Wait for Splash Screen
    [Documentation]    Wait for the JupyterLab splash animation to run its course
    Wait Until Page Contains Element    ${SPLASH_ID}    timeout=30s
    Wait Until Page Does Not Contain Element    ${SPLASH_ID}    timeout=30s
    Sleep    0.1s

Launch a new
    [Arguments]    ${kernel}    ${category}
    [Documentation]    Use the JupyterLab launcher to launch Notebook or Console
    ${sel} =    Set Variable    ${CARD}\[@title='${kernel}'][@data-category='${category}']
    Wait Until Page Contains Element    ${sel}    timeout=20s
    Click Element    ${sel}
    Wait Until Page Does Not Contain Element    ${SPINNER}
    Wait Until Page Contains Element    css:${CELL_CSS}

Start JupyterLab
    [Documentation]    Start a Jupyter Notebook Server with JupyterLab
    ${home} =    Set Variable    ${OUTPUT_DIR}${/}home
    Create Directory    ${home}
    Copy File    tests${/}etc${/}jupyter_notebook_config.json    ${home}
    ${log} =    Set Variable    ${OUTPUT_DIR}${/}lab.log
    Start Process    ${LAB_CMD}    shell=true    stderr=STDOUT    stdout=${log}    cwd=${home}
    Sleep    5s

Click JupyterLab Menu
    [Arguments]    ${menu_label}
    [Documentation]    Click a top-level JupyterLab Menu bar, e.g. File, Help, etc.
    Wait Until Page Contains Element    ${TOP}${BAR_ITEM}\[text() = '${menu_label}']
    Mouse Over    ${TOP}${BAR_ITEM}\[text() = '${menu_label}']
    Click Element    ${TOP}${BAR_ITEM}\[text() = '${menu_label}']

Click JupyterLab Menu Item
    [Arguments]    ${item_label}
    [Documentation]    Click a top-level JupyterLab Menu Item (not File, Help, etc.)
    ${item} =    Set Variable    //div[contains(@class,'lm-Menu-itemLabel')]
    Wait Until Page Contains Element    ${item}\[text() = '${item_label}']
    Mouse Over    ${item}\[text() = '${item_label}']
    Click Element    ${item}\[text() = '${item_label}']

Open JupyterLab
    [Documentation]    Start the given browser and wait for the animation
    Go To    ${LAB_URL}
    Wait for Splash Screen
    Sleep    1s

Execute JupyterLab Command
    [Arguments]    ${command}
    [Documentation]    Use the JupyterLab Command Palette to run a command
    Run Keyword And Ignore Error    Click Element    css:.jp-mod-accept
    Click Element    ${CMD_PAL_CSS}
    Input Text    ${CMD_PAL_INPUT}    ${command}
    Wait Until Page Contains Element    ${CMD_PAL_ITEM}
    Click Element    ${CMD_PAL_ITEM}
    Run Keyword And Ignore Error    Click Element    ${CMD_PAL_XPATH}

Reset Application State and Close
    [Documentation]    Try to clean up after doing some things to the JupyterLab state
    Set Screenshot Directory    ${OUTPUT_DIR}
    Execute JupyterLab Command    Reset Application State
    Close Browser

Clean Up JupyterLab
    [Documentation]    Close all the browsers and stop all processes
    Set Screenshot Directory    ${OUTPUT_DIR}
    Close All Browsers
    Terminate All Processes    kill=True

Maybe Close Sidebar
    [Arguments]    ${side}=left
    [Documentation]    Clean up some real estate
    ${els} =    Get WebElements    css:.jp-SideBar.jp-mod-${side.lower()} .lm-mod-current
    Run Keyword If    ${els.__len__}    Click Element    ${els[0]}
