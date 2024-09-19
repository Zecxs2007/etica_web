import express from 'express';
import admin from 'firebase-admin';
import Firebird from 'node-firebird';
import ini from 'ini';
import fs from 'fs';

const app = express();
const port = 7584;

// Leitura do arquivo .ini
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
const dbOptions = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    charset: config.database.charset,
};

let time = config.database.time || 60000;

admin.initializeApp({
    credential: admin.credential.cert("serviceAccountKey.json")
});

const firestore = admin.firestore(); 

// Declaração da consulta SQL
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
        PEDIDO.CANCELADO = 'N'
    AND
        PEDIDO.CONFIRMADA = 'S'
    AND
        PEDIDO.NFCE_OFFLINE = 'S'
    GROUP BY 
        EMPRESA.FANTASIA, EMPRESA.CNPJ_CPF, EMPRESA.ID;
`;

// Rota para buscar e atualizar dados no Firestore
app.get('/atualizar-cupons', async (req, res) => {
    Firebird.attach(dbOptions, async (err, db) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        db.query(selectCupons, async (err, result) => {
            if (err) {
                console.error('Erro ao executar a query:', err.message);
                db.detach();
                return res.status(500).send('Erro ao executar a query');
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
                res.send('Dados atualizados com sucesso!');
            } catch (error) {
                console.error('Erro ao enviar dados ao Firestore:', error.message);
                res.status(500).send('Erro ao enviar dados ao Firestore');
            } finally {
                db.detach();
            }
        });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
