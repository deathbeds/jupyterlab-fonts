*** Settings ***
Documentation       Keywords for working with browser coverage data

Library             OperatingSystem
Library             JupyterLibrary
Library             uuid


*** Keywords ***
Get Next Coverage File
    [Documentation]    Get a random filename.
    ${uuid} =    UUID1
    RETURN    ${uuid.__str__()}

Capture Page Coverage
    [Documentation]    Fetch coverage data from the browser.
    [Arguments]    ${name}=${EMPTY}
    IF    not '''${name}'''
        ${name} =    Get Next Coverage File
    END
    ${cov_json} =    Execute Javascript
    ...    return window.__coverage__ && JSON.stringify(window.__coverage__, null, 2)
    IF    ${cov_json}
        Create File    ${ROBOCOV}${/}${name}.json    ${cov_json}
    END

Reset JupyterLab And Close With Coverage
    [Documentation]    Close JupyterLab after gathering coverage.
    Capture Page Coverage
    Reset JupyterLab And Close
