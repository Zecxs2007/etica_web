import fdb
import requests
import json
from datetime import datetime

# Conectar ao banco de dados Firebird
def conectar_firebird():
    con = fdb.connect(
        dsn='C:\\ettica\\exec\\dados\\dados.fdb',  # Caminho para o arquivo do banco de dados
        user='SYSDBA',  # Usuário do Firebird
        password='masterkey',  # Senha do banco de dados
        charset='UTF8'
    )
    return con

senha = "tst"
# Buscar a quantidade de cupons acumulados por cliente
def buscar_cupons(con):
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
# Enviar dados para a API
def enviar_dados_api(dados):
    url = 'http://localhost:7584/dados'  # URL da sua API
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(dados[0]))
    print(json.dumps(dados))
    if response.status_code == 200:
        print("Dados enviados com sucesso!")
    else:
        print(f"Erro ao enviar dados: {response.status_code}")

# Função principal
def main():
    con = conectar_firebird()
    dados = buscar_cupons(con)
    enviar_dados_api(dados)
    con.close()

if __name__ == '__main__':
    main()

