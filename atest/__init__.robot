*** Settings ***
Documentation     Test interactive typography in JupyterLab
Library           JupyterLibrary
Suite Setup       Prepare for testing fonts
Suite Teardown    Clean up after testing fonts

*** Keywords ***
Prepare for testing fonts
    ${py} =    Evaluate    __import__("sys").version.split(" ")[0]
    ${platform} =    Evaluate    __import__("platform").system()
    Set Global Variable    ${PY}    ${py}
    Set Global Variable    ${PLATFORM}    ${platform}
    Set Tags    py:${PY}    os:${platform}
    Wait for New Jupyter Server to be Ready
    Open JupyterLab
    Set Window Size    1366    768
    Disable JupyterLab Modal Command Palette

Clean up after testing fonts
    Terminate All Jupyter Servers
    Close All Browsers
