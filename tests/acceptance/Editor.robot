*** Settings **
Library         SeleniumLibrary
Library         BuiltIn
Resource        ../resources/Browser.robot
Resource        ../resources/Lab.robot
Resource        ../resources/Notebook.robot
Suite Teardown  Kill'em all


*** Test Cases **
Customize code font with the Global Font Editor
  Start Jupyterlab
  Open JupyterLab with        ${BROWSER}
  Sleep                       1s
  Make a Hello World          Python 3    Notebook
  Open the Global Fonts Editor
  Sleep                       0.1s
  Capture Page Screenshot     editor_00.png
  Use the Global Font Editor to set the Code Font Font to Fira Code Bold
  Capture Page Screenshot     editor_01_bold.png
  Use the Global Font Editor to set the Code Font Font to Fira Code Light
  Capture Page Screenshot     editor_02_light.png
  [Teardown]                  Reset Application State and Close


*** Keywords ***
Open the Global Fonts Editor
  Click JupyterLab Menu       Settings
  Click JupyterLab Menu Item  Fonts
  Click JupyterLab Menu Item  Global Fonts...

Use the ${scope} font editor to Set the ${kind} Font ${aspect} to ${value}
  Select From List
    ...   css:.jp-FontsEditor section[title="${kind}"] select[title="${aspect}"]
    ...   ${value}
