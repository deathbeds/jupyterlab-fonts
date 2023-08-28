*** Settings ***
Documentation       Variables for testing jupyterlab-fonts


*** Variables ***
${ED}                                   css:.jp-FontsEditor
${DOCK}                                 //div[@id='jp-main-dock-panel']
${TAB}                                  li[contains(@class, 'lm-TabBar-tab')]
${ICON_FONT}                            *[@data-icon = 'fonts:fonts']
${ICON_LICENSE}                         *[@data-icon = 'fonts:license']
${ICON_SETTINGS}                        *[@data-icon = 'ui-components:settings']
${ICON_NOTEBOOK}                        *[@data-icon = 'ui-components:notebook']
${ICON_CLOSE}                           div[contains(@class, 'lm-TabBar-tabCloseIcon')]
${BUTTON}                               .jp-FontsEditor-button
${SETTING_ITEM}                         //div[contains(@class, 'jp-PluginList')]//div
${SETTINGS_RAW}                         .jp-SettingsRawEditor-user
${SHEET}                                .jp-Fonts-Sheet
${MOD_GLOBAL}                           .jp-fonts-mod-global
${MOD_NOTEBOOK}                         .jp-fonts-mod-notebook
${DATA_TAGS}                            data-jpf-cell-tags
${DATA_CELL_ID}                         data-jpf-cell-id
# lab
${CSS_LAB_MOD_HIDDEN}                   .lm-mod-hidden
${CSS_LAB_CELL_META_JSON_CM}            .jp-MetadataEditorTool .CodeMirror
${CSS_LAB_CELL_META_JSON_CM_HIDDEN}     ${CSS_LAB_MOD_HIDDEN} ${CSS_LAB_CELL_META_JSON_CM}
${CSS_LAB_ADVANCED_COLLAPSE}            .jp-NotebookTools .jp-Collapse-header
${CSS_LAB_CELL_META_TOOL}               .jp-RankedPanel .jp-MetadataEditorTool:nth-child(1)
${CSS_LAB_NOTEBOOK_META_TOOL}           .jp-RankedPanel .jp-MetadataEditorTool:nth-child(2)
${CSS_LAB_META_COMMIT}                  [data-icon="ui-components:check"]
# lab4/nb7
${XP_LAB4_COLLAPSED_PANEL}              //*[contains(@class, 'jp-Collapse-header-collapsed')]
${XP_LAB4_COLLAPSED_PANEL_TITLE}        ${XP_LAB4_COLLAPSED_PANEL}//*[contains(@class, 'jp-Collapser-title')]
${CSS_LAB4_OPEN_IN_NOTEBOOK}            .jp-ToolbarButtonComponent[data-command="jupyter-notebook:open-notebook"]
# rfjl bugs
${CM CSS EDITOR}                        .CodeMirror
