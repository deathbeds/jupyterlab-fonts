*** Settings ***
Documentation     Test whether the JupyterLab Fonts Menu performs as advertised.
Suite Setup       Prepare for testing fonts
Suite Teardown    Clean Up JupyterLab
Library           SeleniumLibrary
Library           BuiltIn
Resource          ../resources/Browser.robot
Resource          ../resources/Lab.robot
Resource          ../resources/Notebook.robot

*** Test Cases ***
Customize code font with the JupyterLab Menu
    [Documentation]    Try out some font settings with the menu
    [Template]    Use the Menu to configure Font
    Code    Font    Default Code Font
    Code    Font    Fira Code Light
    Code    Font    Fira Code Regular
    Code    Font    Fira Code Medium
    Code    Font    Fira Code Bold

*** Keywords ***
Use the Menu to configure Font
    [Arguments]    ${kind}    ${aspect}    ${setting}
    [Documentation]    Set a font value in the JupyterLab Fonts Menu
    Set Screenshot Directory    ${OUTPUT_DIR}/menus/${kind}_${aspect}_${setting}
    Click JupyterLab Menu    Settings
    Capture Page Screenshot    00_settings.png
    Click JupyterLab Menu Item    Fonts
    Capture Page Screenshot    01_fonts.png
    Click JupyterLab Menu Item    ${kind}
    Capture Page Screenshot    02_code.png
    Click JupyterLab Menu Item    ${aspect}
    Capture Page Screenshot    03_font.png
    Click JupyterLab Menu Item    ${setting}
    Capture Page Screenshot    04_done.png
