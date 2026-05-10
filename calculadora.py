import webview

# URL DE github pages
url_de_mi_web = ''

ventana = webview.create_window(
    'EvoFinance Calculator', 
    url=url_de_mi_web, # Ahora carga desde internet
    width=340, 
    height=480, 
    resizable=False
)

webview.start()