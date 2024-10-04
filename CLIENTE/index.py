import fdb
import requests
import json
from datetime import datetime
import configparser
import time
import logging

#pyinstaller --noconsole --icon=icon.ico --onefile index.py
#comando para copilar

# Configura o logging para gravar as mensagens em um arquivo .log
logging.basicConfig(filename='err.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Cria instância para ler o arquivo config.ini
config = configparser.ConfigParser()
config.read('config.ini')

# Busca os dados para a conexão do firebird
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

# Buscar a quantidade de cupons acumulados por cliente
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

        # Envia os dados em forma de json
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

# Enviar dados para a API
def enviar_dados_api(dados):
    url = config['database']['url']  # URL da API
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

# Função principal
def main():
    while True:  # Loop infinito
        senha = "trigominas2025"

        con = conectar_firebird()
        if con:
            try:
                dados = buscar_cupons(con, senha)
                if dados:
                    enviar_dados_api(dados)
            finally:
                con.close()

        tempo = int(config['database']['tempo'])
        # Pausa o loop pelo tempo definido no config em segundos
        logging.info(f"Aguardando {tempo} segundos para a próxima execução...")

        time.sleep(tempo)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Execução interrompida pelo usuário.")
