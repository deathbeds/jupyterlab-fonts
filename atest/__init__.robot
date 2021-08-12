*** Settings ***
Documentation     Test interactive typography in JupyterLab
Library           JupyterLibrary
Suite Setup       Prepare for testing fonts
Suite Teardown    Clean up after testing fonts

*** Keywords ***
Prepare for testing fonts
    Wait for New Jupyter Server to be Ready
    Open JupyterLab
    Set Window Size    1920    1080
    Disable JupyterLab Modal Command Palette

Clean up after testing fonts
    Terminate All Jupyter Servers
    Close All Browsers
