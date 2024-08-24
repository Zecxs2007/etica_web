import express from 'express';
import admin from 'firebase-admin';
import Firebird from 'node-firebird';

const app = express();

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

// Configuração do Firebird
const dbOptions = {
    host: 'localhost',
    port: 3050,
    database: 'c:/ettica/exec/dados/dados.fdb',
    user: 'SYSDBA',
    password: 'masterkey',
    charset: 'UTF8'
};

// Inicializar o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert("serviceAccountKey.json")
});

const firestore = admin.firestore(); // Definição da variável firestore

// Usar JSON no corpo das requisições
app.use(express.json());

// GET http://api.clientes-contigencia.com/info/firebase para recuperar dados do Firestore
app.get('/dados/firebase', (req, res) => {
    console.log('GET dados');
    admin.firestore()
        .collection('CLIENTES')
        .get()
        .then(snapshot => {
            const dados = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            }));
            res.json(dados);
        })
        .catch(error => {
            res.status(500).json({ error: 'Erro ao recuperar dados do Firestore', detalhes: error.message });
        });
});

// GET http://api.clientes-contigencia.com/info/firebird para recuperar dados do Firebird
app.get('/dados/firebird', (req, res) => {
    Firebird.attach(dbOptions, (err, db) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao conectar ao banco de dados', detalhes: err.message });
        }

        db.query(selectCupons, (err, result) => {
            if (err) {
                db.detach();
                return res.status(500).json({ error: 'Erro ao executar a query', detalhes: err.message });
            }

            const dados = result.map(row => ({
                ID: row.EMPRESA_ID,
                NOME: row.NOME,      
                CNPJ_CPF: row.CNPJ_CPF,
                CUPONS_ACUMULADOS: row.TOTAL_CUPONS
            }));

            res.json(dados);
            db.detach();
        });
    });
});

// POST http://api.clientes-contigencia.com/info para enviar dados do Firebird ao Firestore
app.post('/dados/enviar-dados', (req, res) => {
    Firebird.attach(dbOptions, (err, db) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao conectar ao banco de dados', detalhes: err.message });
        }

        db.query(selectCupons, (err, result) => {
            if (err) {
                db.detach();
                return res.status(500).json({ error: 'Erro ao executar a query', detalhes: err.message });
            }

            const promises = result.map(row => {
                const dados = {
                    ID: row.EMPRESA_ID,
                    NOME: row.NOME,      
                    CNPJ_CPF: row.CNPJ_CPF,
                    CUPONS_ACUMULADOS: row.TOTAL_CUPONS
                };
                return firestore.collection('CLIENTES').add(dados);
            });

            Promise.all(promises)
                .then(() => {
                    res.status(200).json({ message: 'Dados enviados ao Firestore com sucesso!' });
                })
                .catch(error => {
                    res.status(500).json({ error: 'Erro ao enviar dados ao Firestore', detalhes: error.message });
                })
                .finally(() => {
                    db.detach();
                });
        });
    });
});

app.listen(3000, () => console.log('API rest foi iniciada em http://localhost:3000'));
