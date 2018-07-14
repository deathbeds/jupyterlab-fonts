def load_jupyter_server_extension(nbapp):
    nbapp.web_app.settings['page_config_data']['buildAvailable'] = False
