*** Settings ***
Documentation       The font editor allows changing fonts in notebooks

Resource            ./_keywords.resource

Test Tags           app:lab


*** Test Cases ***
Notebook Font Editor
    [Documentation]    Customize Notebook fonts with the Font Editor
    [Template]    Use the font editor to configure fonts
    [Setup]    Open the Notebook Font Editor
    Notebook    Code    -
    Notebook    Code    Anonymous Pro Bold
    Notebook    Code    Anonymous Pro Regular
    Notebook    Code    DejaVu Sans Mono
    Notebook    Code    DejaVu Sans Mono Bold
    Notebook    Code    Fira Code Bold
    Notebook    Code    Fira Code Light
    Notebook    Code    Fira Code Medium
    Notebook    Code    Fira Code Regular
    Notebook    Content    -
    Notebook    Content    Atkinson Hyperlegible Regular
    Notebook    Content    Atkinson Hyperlegible Bold
    Notebook    UI    -
    Notebook    UI    Atkinson Hyperlegible Regular
    Notebook    UI    Atkinson Hyperlegible Bold
    [Teardown]    Close the Font Editor    Untitled
