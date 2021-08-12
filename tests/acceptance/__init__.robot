*** Settings ***
Documentation     Test interactive typography in JupyterLab
Library           JupyterLibrary
Suite Setup       Prepare for testing fonts
Suite Teardown    Terminate All Jupyter Servers

*** Keywords ***
Prepare for testing fonts
    Wait for New Jupyter Server to be Ready
    Open JupyterLab
    Set Window Size    1920    1080
    Disable JupyterLab Modal Command Palette
