*** Settings **
Library         SeleniumLibrary
Library         BuiltIn
# Library         tests.resources.Fonts
Resource        ../resources/Browser.robot
Resource        ../resources/Lab.robot
Resource        ../resources/Notebook.robot
Suite Teardown  Kill'em all


*** Test Cases **
Customize Global fonts with the Global Font Editor
  Start Jupyterlab
  Open JupyterLab with        ${BROWSER}
  Sleep                       1s
  Make a Hello World          Python 3    Notebook
  Open the Global Fonts Editor
  Sleep                       0.1s
  Capture Page Screenshot     global_editor_00.png
  Use the Global Font Editor to set the Code Font to Fira Code Bold
  Use the Global Font Editor to set the Code Font to Fira Code Light
  Use the Global Font Editor to set the Code Font to -
  Use the Global Font Editor to set the Code Line Height to 2
  Use the Global Font Editor to set the Code Line Height to -
  Use the Global Font Editor to set the Code Size to 20px
  Use the Global Font Editor to set the Code Size to -
  [Teardown]                  Reset Application State and Close

Customize Global fonts with the Notebook Font Editor
  Start Jupyterlab
  Open JupyterLab with        ${BROWSER}
  Sleep                       1s
  Make a Hello World          Python 3    Notebook
  Open the Notebook Font Editor
  Sleep                       0.1s
  Capture Page Screenshot     notebook_editor_00.png
  Use the Notebook Font Editor to set the Code Font to Fira Code Bold
  Use the Notebook Font Editor to set the Code Font to Fira Code Light
  Use the Notebook Font Editor to set the Code Font to -
  Use the Notebook Font Editor to set the Code Line Height to 2
  Use the Notebook Font Editor to set the Code Line Height to -
  Use the Notebook Font Editor to set the Code Size to 20px
  Use the Notebook Font Editor to set the Code Size to -
  [Teardown]                  Reset Application State and Close




*** Keywords ***
Open the Global Fonts Editor
  Click JupyterLab Menu       Settings
  Click JupyterLab Menu Item  Fonts
  Click JupyterLab Menu Item  Global Fonts...

Open the Notebook Font Editor
  Click Element    css:.jp-Toolbar-item.jp-FontsIcon

Use the ${scope} font editor to Set the ${kind} ${aspect} to ${value}
  Select From List By Label
    ...   css:.jp-FontsEditor section[title="${kind}"] select[title="${aspect}"]
    ...   ${value}
  Capture Page Screenshot     ${scope}_editor_${kind}_${aspect}_${value}.png
