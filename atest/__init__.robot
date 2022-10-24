*** Settings ***
Documentation       Test interactive typography in JupyterLab

Library             OperatingSystem
Library             JupyterLibrary
Library             uuid

Suite Setup         Prepare for testing fonts
Suite Teardown      Clean up after testing fonts

Force Tags          py:${py}    os:${os}    attempt:${attempt}


*** Variables ***
${LOG_DIR}      ${OUTPUT_DIR}${/}logs


*** Keywords ***
Prepare for testing fonts
    ${port} =    Get Unused Port
    ${base_url} =    Set Variable    /@rf/
    ${token} =    UUID4
    Create Directory    ${LOG_DIR}
    Wait for New Jupyter Server to be Ready
    ...    jupyter-lab
    ...    ${port}
    ...    ${base_url}
    ...    ${NONE}    # notebook_dir
    ...    ${token.__str__()}
    ...    --config\=${ROOT}${/}atest${/}fixtures${/}jupyter_config.json
    ...    --no-browser
    ...    --debug
    ...    --port\=${port}
    ...    --NotebookApp.token\='${token.__str__()}'
    ...    --NotebookApp.base_url\='${base_url}'
    ...    stdout=${LOG_DIR}${/}lab.log
    Open JupyterLab
    Set Window Size    1366    768
    Disable JupyterLab Modal Command Palette

Clean up after testing fonts
    Terminate All Jupyter Servers
    Close All Browsers
