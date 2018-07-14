*** Settings **
Library         SeleniumLibrary
Library         BuiltIn
Resource        ../resources/Browser.robot
Resource        ../resources/Lab.robot
Resource        ../resources/Notebook.robot
Suite Teardown  Kill'em all


*** Test Cases **
Customize code font with the JupyterLab Menu
  Start Jupyterlab
  Open JupyterLab with        ${BROWSER}
  Sleep                       1s
  Make a Hello World          Python 3    Notebook
  Use the Menu to set the Code Font Family to Fira Code Bold
  Capture Page Screenshot     01_fira_bold.png
  Use the Menu to set the Code Font Family to Fira Code Light
  Capture Page Screenshot     02_fira_reg.png
  [Teardown]                  Reset Application State and Close


*** Keywords ***
Use the Menu to set the ${kind} Font ${aspect} to ${setting}
  Click JupyterLab Menu       Settings
  Capture Page Screenshot     000_${kind}_${aspect}_${setting}_settings.png
  Click JupyterLab Menu Item  Fonts
  Capture Page Screenshot     001_${kind}_${aspect}_${setting}_fonts.png
  Click JupyterLab Menu Item  ${kind}
  Capture Page Screenshot     002_${kind}_${aspect}_${setting}_code.png
  Click JupyterLab Menu Item  ${aspect}
  Capture Page Screenshot     003_${kind}_${aspect}_${setting}_family.png
  Click JupyterLab Menu Item  ${setting}
