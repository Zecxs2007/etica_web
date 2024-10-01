import fdb
import requests
import json
from datetime import datetime
import configparser
import time  # Import time for the sleep function

# Conectar ao banco de dados Firebird
config = configparser.ConfigParser()
config.read('config.ini')  # Ensure correct path to config.ini
senha = 'tst'

def conectar_firebird():
    try:
        con = fdb.connect(
            dsn=config['database']['host'],
            user=config['database']['user'],
            password=config['database']['password'],
            charset='UTF8'
        )
        return con
    except fdb.DatabaseError as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

# Buscar a quantidade de cupons acumulados por cliente
def buscar_cupons(con, senha):
    try:
        cur = con.cursor()  # Manually handle cursor
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
        cur.close()  # Manually close cursor

        dados = []
        for row in resultados:
            dados.append({
                "CNPJ": row[0],
                "Nome": row[1],
                "QuantidadeCupons": row[2],
                "DataHora": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "senha": senha
            })
        print(dados)
        return dados
    except fdb.Error as e:
        print(f"Erro ao buscar cupons: {e}")
        return []

# Enviar dados para a API
def enviar_dados_api(dados):
    url = 'http://localhost:7584/dados'  # URL da sua API
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(dados[0]))
        if response.status_code == 200:
            print("Dados enviados com sucesso!")
            print(f"Resposta da API: {response.json()}")
        else:
            print(f"Erro ao enviar dados: {response.status_code} - {response.text}")
    except requests.RequestException as e:
        print(f"Erro ao enviar dados para a API: {e}")

# Função principal
def main():
    while True:  # Loop infinito
        senha = "tst"  # Senha pode ser passada dinamicamente se necessário

        con = conectar_firebird()
        if con:
            try:
                dados = buscar_cupons(con, senha)
                if dados:
                    enviar_dados_api(dados)
            finally:
                con.close()  # Ensure connection is closed

        tempo = int(config['database']['tempo'])
        # Pausa o loop por 5 minutos (300 segundos)
        print(f"Aguardando {tempo} segundos para a próxima execução...")

        time.sleep(tempo)
        

if __name__ == '__main__':
    main()
