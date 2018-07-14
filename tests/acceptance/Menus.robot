*** Settings ***
Documentation   Test whether the JupyterLab Fonts Menu performs as advertised.
Library         SeleniumLibrary
Library         BuiltIn
Resource        ../resources/Browser.robot
Resource        ../resources/Lab.robot
Resource        ../resources/Notebook.robot
Test Teardown   Reset Application State and Close
Suite Teardown  Clean Up JupyterLab


*** Test Cases ***
Customize code font with the JupyterLab Menu
  [Documentation]   Try out some font settings with the menu
  Start Jupyterlab
  Open JupyterLab with        ${BROWSER}
  Make a Hello World          Python 3    Notebook
  Use the Menu to set the Code Font Family to Fira Code Bold
  Capture Page Screenshot     01_fira_bold.png
  Use the Menu to set the Code Font Family to Fira Code Light
  Capture Page Screenshot     02_fira_reg.png


*** Keywords ***
Use the Menu to set the ${kind} Font ${aspect} to ${setting}
  [Documentation]   Set a font value in the JupyterLab Fonts Menu
  Click JupyterLab Menu       Settings
  Capture Page Screenshot     000_${kind}_${aspect}_${setting}_settings.png
  Click JupyterLab Menu Item  Fonts
  Capture Page Screenshot     001_${kind}_${aspect}_${setting}_fonts.png
  Click JupyterLab Menu Item  ${kind}
  Capture Page Screenshot     002_${kind}_${aspect}_${setting}_code.png
  Click JupyterLab Menu Item  ${aspect}
  Capture Page Screenshot     003_${kind}_${aspect}_${setting}_family.png
  Click JupyterLab Menu Item  ${setting}
