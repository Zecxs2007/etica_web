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
    firestore.collection('CLIENTES')
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
app.post('/dados/enviar-dados', async (req, res) => {
    Firebird.attach(dbOptions, async (err, db) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao conectar ao banco de dados', detalhes: err.message });
        }

        db.query(selectCupons, async (err, result) => {
            if (err) {
                db.detach();
                return res.status(500).json({ error: 'Erro ao executar a query', detalhes: err.message });
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
                        // Atualizar o cliente existente
                        await clienteRef.update(dados);
                    } else {
                        // Criar um novo cliente
                        await clienteRef.set(dados);
                    }
                });

                await Promise.all(promises);
                res.status(200).json({ message: 'Dados enviados ao Firestore com sucesso!' });
            } catch (error) {
                res.status(500).json({ error: 'Erro ao enviar dados ao Firestore', detalhes: error.message });
            } finally {
                db.detach();
            }
        });
    });
});

app.listen(3000, () => console.log('API rest foi iniciada em http://localhost:3000'));
