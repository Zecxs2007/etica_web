import fdb
import requests
import json
from datetime import datetime
import configparser
import time
import logging
import tkinter as tk
from tkinter import messagebox, simpledialog
import threading
import pystray
from PIL import Image, ImageDraw

# Configuração de logging
logging.basicConfig(filename='err.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Cria instância para ler o arquivo config.ini
config = configparser.ConfigParser()
config.read('config.ini')

# Funções do seu código
def conectar_firebird():
    try:
        con = fdb.connect(
            dsn=config['database']['host'],
            user=config['database']['user'],
            password=config['database']['password'],
            charset='UTF8'
        )
        logging.info("Conexão com o Firebird estabelecida.")
        return con
    except fdb.DatabaseError as e:
        logging.error(f"Erro ao conectar ao banco de dados: {e}")
        return None

def buscar_cupons(con, senha):
    try:
        cur = con.cursor()
        query = """
            SELECT
            EMPRESA.CNPJ_CPF,
            EMPRESA.FANTASIA,
            COUNT(PEDIDO.ID) AS QUANTIDADECUPONS
            FROM
            EMPRESA
            LEFT JOIN
            PEDIDO ON EMPRESA.ID = PEDIDO.IDEMPRESA
            AND PEDIDO.NFCE_OFFLINE = 'S'
            AND PEDIDO.CANCELADO = 'N'
            GROUP BY
            EMPRESA.CNPJ_CPF, EMPRESA.FANTASIA
        """
        cur.execute(query)
        resultados = cur.fetchall()
        cur.close()

        dados = []
        for row in resultados:
            dados.append({
                "CNPJ": row[0],
                "Nome": row[1],
                "QuantidadeCupons": row[2],
                "DataHora": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "senha": senha
            })

        logging.info(f"{len(dados)} registros encontrados.")
        return dados
    except fdb.Error as e:
        logging.error(f"Erro ao buscar cupons: {e}")
        return []

def enviar_dados_api(dados):
    url = config['database']['url']
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(dados[0]))
        if response.status_code == 200:
            logging.info("Dados enviados com sucesso.")
            logging.info(f"Resposta da API: {response.json()}")
        else:
            logging.error(f"Erro ao enviar dados: {response.status_code} - {response.text}")
    except requests.RequestException as e:
        logging.error(f"Erro ao enviar dados para a API: {e}")

# Função para executar o envio de cupons periodicamente
def executar_codigo_periodico():
    senha = "trigominas2025"
    while True:
        con = conectar_firebird()
        if con:
            try:
                dados = buscar_cupons(con, senha)
                if dados:
                    enviar_dados_api(dados)
            finally:
                con.close()

        tempo = int(config['database']['tempo'])  # Pega o tempo de intervalo
        logging.info(f"Aguardando {tempo} segundos para a próxima execução...")
        time.sleep(tempo)  # Aguarda antes de executar novamente

# Função para fazer um envio manual de cupons
def enviar_manual():
    senha = "trigominas2025"
    con = conectar_firebird()
    if con:
        try:
            dados = buscar_cupons(con, senha)
            if dados:
                enviar_dados_api(dados)
                messagebox.showinfo("Envio Manual", "Dados enviados manualmente com sucesso!")
        finally:
            con.close()

# Função que será chamada ao iniciar para começar o envio automático
def iniciar_envio_automatico():
    # Cria uma thread separada para o envio automático
    envio_thread = threading.Thread(target=executar_codigo_periodico)
    envio_thread.daemon = True  # Faz com que a thread termine quando a janela fechar
    envio_thread.start()

# Função para editar e salvar o arquivo config.ini
def configurar_parametros():
    def salvar_config():
        # Captura os valores editados
        config['database']['host'] = host_entry.get()
        config['database']['user'] = user_entry.get()
        config['database']['password'] = password_entry.get()
        config['database']['tempo'] = tempo_entry.get()
        config['database']['url'] = url_entry.get()

        # Salva as alterações no arquivo config.ini
        with open('config.ini', 'w') as configfile:
            config.write(configfile)
        messagebox.showinfo("Configuração", "Configurações salvas com sucesso!")

    config_window = tk.Toplevel()
    config_window.title("Configurar Parâmetros")

    tk.Label(config_window, text="Host:").pack()
    host_entry = tk.Entry(config_window, width=50)
    host_entry.insert(0, config['database']['host'])
    host_entry.pack()

    tk.Label(config_window, text="Usuário:").pack()
    user_entry = tk.Entry(config_window, width=50)
    user_entry.insert(0, config['database']['user'])
    user_entry.pack()

    tk.Label(config_window, text="Senha:").pack()
    password_entry = tk.Entry(config_window, width=50, show="*")
    password_entry.insert(0, config['database']['password'])
    password_entry.pack()

    tk.Label(config_window, text="Tempo (segundos):").pack()
    tempo_entry = tk.Entry(config_window, width=50)
    tempo_entry.insert(0, config['database']['tempo'])
    tempo_entry.pack()

    tk.Label(config_window, text="URL da API:").pack()
    url_entry = tk.Entry(config_window, width=50)
    url_entry.insert(0, config['database']['url'])
    url_entry.pack()

    salvar_btn = tk.Button(config_window, text="Salvar", command=salvar_config)
    salvar_btn.pack(pady=10)

# Função para criar o ícone da bandeja do sistema
# Função para criar o ícone da bandeja do sistema
def criar_icone_bandeja():
    # Função para desenhar o ícone
    def criar_icone():
        img = Image.new('RGB', (64, 64), color=(73, 109, 137))
        d = ImageDraw.Draw(img)
        d.text((10, 10), "App", fill=(255, 255, 0))
        return img

    # Função para restaurar a janela principal
    def restaurar_janela(icon, item):
        root.deiconify()  # Mostra a janela principal novamente
        icon.stop()  # Remove o ícone da bandeja

    # Função para sair do aplicativo
    def sair(icon, item):
        icon.stop()
        root.quit()

    # Cria o ícone da bandeja


    # Função modificada para minimizar a janela principal e exibir o ícone na bandeja
    def minimizar_para_bandeja():
        root.withdraw() # Esconde a janela principal
        icone = pystray.Icon("app_name", criar_icone(), menu=pystray.Menu(
            pystray.MenuItem("Restaurar", restaurar_janela),
            pystray.MenuItem("Sair", sair)
        ))
        icone.run()

    # Associa o evento de minimizar
    root.protocol("WM_DELETE_WINDOW", minimizar_para_bandeja)

# Interface gráfica com Tkinter
def iniciar_interface():
    global root
    root = tk.Tk()
    root.title("Sistema de Cupons")
    root.geometry("400x300")

    label = tk.Label(root, text="Sistema de Envio de Cupons", font=("Arial", 16))
    label.pack(pady=20)

    manual_btn = tk.Button(root, text="Enviar Manualmente", command=enviar_manual, width=20, height=2)
    manual_btn.pack(pady=10)

    config_btn = tk.Button(root, text="Configurar Parâmetros", command=configurar_parametros, width=20, height=2)
    config_btn.pack(pady=10)

    sair_btn = tk.Button(root, text="Sair", command=root.quit, width=20, height=2)
    sair_btn.pack(pady=10)

    iniciar_envio_automatico()
    criar_icone_bandeja()  # Chama a função para criar o ícone da bandeja

    root.mainloop()

if __name__ == '__main__':
    try:
        iniciar_interface()
    except KeyboardInterrupt:
        logging.info("Execução interrompida pelo usuário.")
