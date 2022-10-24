*** Settings ***
Documentation       The font editor allows changing fonts in notebooks

Resource            ./_keywords.resource


*** Test Cases ***
Global Font Editor
    [Documentation]    Customize Global fonts with the Font Editor
    [Template]    Use the font editor to configure fonts
    [Setup]    Open the Global Font Editor
    Global    Code    Anonymous Pro Bold
    Global    Code    Anonymous Pro Regular
    Global    Code    DejaVu Sans Mono
    Global    Code    DejaVu Sans Mono Bold
    Global    Code    Fira Code Bold
    Global    Code    Fira Code Light
    Global    Code    Fira Code Medium
    Global    Code    Fira Code Regular
    Global    Content    Anonymous Pro Bold
    Global    Content    Anonymous Pro Regular
    Global    Content    DejaVu Sans Mono
    Global    Content    DejaVu Sans Mono Bold
    Global    Content    Fira Code Bold
    Global    Content    Fira Code Light
    Global    Content    Fira Code Medium
    Global    Content    Fira Code Regular
    [Teardown]    Close the Font Editor    Global
