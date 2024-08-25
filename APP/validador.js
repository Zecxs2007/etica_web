import http from 'http';
import admin from 'firebase-admin';
import Firebird from 'node-firebird';

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

admin.initializeApp({
    credential: admin.credential.cert("serviceAccountKey.json")
  });
  
  const firestore = admin.firestore(); // Definição da variável firestore

// Creating server 
const server = http.createServer((req, res) => {
    // Sending the response
    res.write("Pong")
    res.end();
})

// Server listening to port 3000
server.listen((3001), () => {
    setInterval(() => {  
        
        Firebird.attach(dbOptions, async (err, db) => {
            if (err) {
                console.log({ error: 'Erro ao conectar ao banco de dados', detalhes: err.message });
            }
    
            db.query(selectCupons, async (err, result) => {
                if (err) {
                    db.detach();
                    console.log({ error: 'Erro ao executar a query', detalhes: err.message });
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
                    console.log({ message: 'Ping' });
                } catch (error) {
                    console.log({ error: 'Erro ao enviar dados ao Firestore', detalhes: error.message });
                } finally {
                    db.detach();
                }
            });
        });

    }, 3600000);
        
        console.log("Server is Running");
    })