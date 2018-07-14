*** Settings **
Library  Process
Library  SeleniumLibrary


*** Variables ***
${CELL_CSS}  .jp-Notebook .jp-Cell:last-of-type .jp-InputArea-editor .CodeMirror

${TOKEN}      hopelesslyinsecure
${LAB_CMD}    jupyter-lab --no-browser --NotebookApp.token=${TOKEN} --port 18888 --NotebookApp.nbserver_extensions='{"tests.resources.testserverextension": True}'
${LAB_URL}    http://localhost:18888/lab?token=${TOKEN}
${SPLASH_ID}  jupyterlab-splash

${CMD_PAL_XPATH}  //div[contains(@class, "jp-mod-left")]//li//div[contains(text(), "Commands")]
${CMD_PAL_INPUT}   css:.p-CommandPalette-input
${CMD_PAL_ITEM}    css:.p-CommandPalette-item

*** Keywords ***
Wait for Splash Screen
  Wait Until Page Contains Element          ${SPLASH_ID}
  Wait Until Page Does Not Contain Element  ${SPLASH_ID}

Launch a new
  [Arguments]   ${kernel}   ${category}
  Click Element             //div[@class='jp-LauncherCard' and @title='${kernel}' and @data-category='${category}']
  Wait Until Page Contains Element    css:${CELL_CSS}

Start JupyterLab
  Start Process             ${LAB_CMD}    shell=true  stderr=STDOUT   stdout=${OUTPUT_DIR}/lab.log

Click JupyterLab Menu
  [Arguments]   ${menu_label}
  Wait Until Page Contains Element
  ...  //div[@id='jp-top-panel']//div[@class='p-MenuBar-itemLabel' and contains(text(), '${menu_label}')]
  Mouse Over
  ...  //div[@id='jp-top-panel']//div[@class='p-MenuBar-itemLabel' and contains(text(), '${menu_label}')]
  Click Element
  ...  //div[@id='jp-top-panel']//div[@class='p-MenuBar-itemLabel' and contains(text(), '${menu_label}')]

Click JupyterLab Menu Item
  [Arguments]   ${item_label}
  Wait Until Page Contains Element
  ...  //div[@class='p-Menu-itemLabel' and contains(text(), '${item_label}')]
  Mouse Over
  ...  //div[@class='p-Menu-itemLabel' and contains(text(), '${item_label}')]
  Click Element
  ...  //div[@class='p-Menu-itemLabel' and contains(text(), '${item_label}')]


Open JupyterLab with
  [Arguments]   ${browser}
  Open Browser              ${LAB_URL}    ${browser}

Execute JupyterLab Command
  [Arguments]     ${command}
  Click Element   ${CMD_PAL_XPATH}
  Input Text      ${CMD_PAL_INPUT}   ${command}
  Wait Until Page Contains Element   ${CMD_PAL_ITEM}
  Click Element   ${CMD_PAL_ITEM}

Reset Application State and Close
  Execute JupyterLab Command            Reset Application State
  Close Browser

Kill'em all
  Close All Browsers
  Terminate All Processes    kill=True
