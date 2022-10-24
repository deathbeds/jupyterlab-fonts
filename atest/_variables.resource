*** Settings ***
Documentation       Variables for testing jupyterlab-fonts

*** Variables ***
${ED}                   css:.jp-FontsEditor
${DOCK}                 //div[@id='jp-main-dock-panel']
${TAB}                  li[contains(@class, 'lm-TabBar-tab')]
${ICON_FONT}            *[@data-icon = 'fonts:fonts']
${ICON_LICENSE}         *[@data-icon = 'fonts:license']
${ICON_SETTINGS}        *[@data-icon = 'ui-components:settings']
${ICON_NOTEBOOK}        *[@data-icon = 'ui-components:notebook']
${ICON_CLOSE}           div[contains(@class, 'lm-TabBar-tabCloseIcon')]
${BUTTON}               .jp-FontsEditor-button
${SETTING_ITEM}         //div[contains(@class, 'jp-PluginList')]//div
${SETTINGS_RAW_CM}      .jp-SettingsRawEditor-user .CodeMirror
