*** Settings ***
Documentation   Test whether the font editor performs as advertised.
Library         SeleniumLibrary
Library         BuiltIn
Resource        ../resources/Browser.robot
Resource        ../resources/Lab.robot
Resource        ../resources/Notebook.robot
Test Teardown   Reset Application State and Close
Suite Teardown  Clean Up JupyterLab


*** Test Cases ***
Global Font Editor
  [Documentation]   Customize Global fonts with the Global Font Editor
  Start Jupyterlab
  Open JupyterLab with        ${BROWSER}
  Make a Hello World          Python 3    Notebook
  Open the Global Fonts Editor
  Capture Page Screenshot     global_editor_00.png
  Use the Global Font Editor to set the Code Font to -
  Use the Global Font Editor to set the Code Font to Fira Code Light
  Use the Global Font Editor to set the Code Font to Fira Code Regular
  Use the Global Font Editor to set the Code Font to Fira Code Medium
  Use the Global Font Editor to set the Code Font to Fira Code Bold
  Use the Global Font Editor to set the Code Font to -
  Use the Global Font Editor to set the Code Line Height to 2
  Use the Global Font Editor to set the Code Line Height to -
  Use the Global Font Editor to set the Code Size to 20px
  Use the Global Font Editor to set the Code Size to -
  Use the Global Font Editor to set disable custom fonts
  Use the Global Font Editor to set enable custom fonts

Notebook Font Editor
  [Documentation]    Customize Global fonts with the Notebook Font Editor
  Start Jupyterlab
  Open JupyterLab with        ${BROWSER}
  Make a Hello World          Python 3    Notebook
  Open the Notebook Font Editor
  Capture Page Screenshot     notebook_editor_00.png
  Use the Notebook Font Editor to set the Code Font to -
  Use the Notebook Font Editor to set the Code Font to Fira Code Light
  Use the Notebook Font Editor to set the Code Font to Fira Code Regular
  Use the Notebook Font Editor to set the Code Font to Fira Code Medium
  Use the Notebook Font Editor to set the Code Font to Fira Code Bold
  Use the Notebook Font Editor to set the Code Font to -
  Use the Notebook Font Editor to set the Code Line Height to 2
  Use the Notebook Font Editor to set the Code Line Height to -
  Use the Notebook Font Editor to set the Code Size to 20px
  Use the Notebook Font Editor to set the Code Size to -


*** Keywords ***
Open the Global Fonts Editor
  [Documentation]   Use the JupyterLab Menu to open the global font editor
  Click JupyterLab Menu       Settings
  Click JupyterLab Menu Item  Fonts
  Click JupyterLab Menu Item  Global Fonts...

Open the Notebook Font Editor
  [Documentation]   Use the Notebook button bar to open the notebook font enditor
  Click Element    css:.jp-Toolbar-item.jp-FontsIcon

Use the ${scope} font editor to Set the ${kind} ${aspect} to ${value}
  [Documentation]   Presently, change a dropdown in the font editor
  Select From List By Label
    ...   css:.jp-FontsEditor section[title="${kind}"] select[title="${aspect}"]
    ...   ${value}
  Capture Page Screenshot     ${scope}_editor_${kind}_${aspect}_${value}.png

Use the Global font editor to ${what} custom fonts
  [Documentation]   Presently, change a checkbox in the font editor
  Run Keyword If    "${what}"=="enable"
  ...   Select Checkbox    css:.jp-FontsEditor-enable input
  Run Keyword If    "${what}"=="disable"
  ...   Unselect Checkbox    css:.jp-FontsEditor-enable input
  Capture Page Screenshot     global_editor_enabled_${what}.png
