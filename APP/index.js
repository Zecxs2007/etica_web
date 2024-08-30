import http from 'http';
import admin from 'firebase-admin';
import Firebird from 'node-firebird';
import ini from 'ini';
import fs from 'fs';

// Leitura do arquivo .ini
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// Configuração da consulta
const selectCupons = `
    SELECT 
        EMPRESA.FANTASIA AS NOME, 
        EMPRESA.CNPJ_CPF, 
        EMPRESA.ID AS EMPRESA_ID,
        COUNT(PEDIDO.ID) AS TOTAL_CUPONS
    FROM 
        EMPRESA
    JOIN 
        PEDIDO ON EMPRESA.ID = PEDIDO.IDEMPRESA
    WHERE 
        PEDIDO.NFCE_OFFLINE = 'S'
    GROUP BY 
        EMPRESA.FANTASIA, EMPRESA.CNPJ_CPF, EMPRESA.ID;
`;

// Configuração do Firebird utilizando o .ini
const dbOptions = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    charset: config.database.charset
};

// Inicializa o Firebase
admin.initializeApp({
    credential: admin.credential.cert("serviceAccountKey.json")
});

const firestore = admin.firestore(); 

// Criação do servidor
const server = http.createServer((req, res) => {
    res.write("Pong");
    res.end();
});

// Ouvindo na porta 3001
server.listen(3001, () => {
    console.log("Server is Running");

    // Atualização de dados a cada 2 segundos
    setInterval(() => {  
        Firebird.attach(dbOptions, async (err, db) => {
            if (err) {
                console.error('Erro ao conectar ao banco de dados:', err.message);
                return;
            }

            db.query(selectCupons, async (err, result) => {
                if (err) {
                    console.error('Erro ao executar a query:', err.message);
                    db.detach();
                    return;
                }

                try {
                    const promises = result.map(async row => {
                        const dados = {
                            ID: row.EMPRESA_ID,
                            NOME: row.NOME,      
                            CNPJ_CPF: row.CNPJ_CPF,
                            CUPONS_ACUMULADOS: row.TOTAL_CUPONS,
                            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                        };

                        const clienteRef = firestore.collection('CLIENTES').doc(row.CNPJ_CPF);
                        const doc = await clienteRef.get();

                        if (doc.exists) {
                            await clienteRef.update(dados);
                        } else {
                            await clienteRef.set(dados);
                        }
                    });

                    await Promise.all(promises);
                    console.log('Dados atualizados com sucesso');
                } catch (error) {
                    console.error('Erro ao enviar dados ao Firestore:', error.message);
                } finally {
                    db.detach();
                }
            });
        });
    }, 2000);
});
