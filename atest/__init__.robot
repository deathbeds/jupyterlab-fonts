*** Settings ***
Documentation       Test interactive typography in JupyterLab

Library             OperatingSystem
Library             JupyterLibrary
Library             uuid
Resource            ./_keywords.resource

Suite Setup         Prepare for testing fonts
Suite Teardown      Clean up after testing fonts

Test Tags           py:${py}    os:${os}    attempt:${attempt}


*** Variables ***
${LOG_DIR}      ${OUTPUT_DIR}${/}logs


*** Keywords ***
Prepare for testing fonts
    ${home_dir} =    Initialize Fake Home
    Initialize Jupyter Server    ${home_dir}
    ${executable_path} =    Get GeckoDriver
    Open JupyterLab    executable_path=${executable_path}
    Set Window Size    1920    1080

Clean up after testing fonts
    Terminate All Jupyter Servers
    Close All Browsers
