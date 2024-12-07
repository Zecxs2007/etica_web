const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 9834;

// Configuração do MongoDB
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'etica';

app.use(cors());

app.get('/dados', async (req, res) => {
    const client = new MongoClient(uri);
    
    try {
        // Conecta ao MongoDB
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('clientes');
        
        // Busca os dados na coleção
        const data = await collection.find({}).toArray();

        // Formata os dados no formato esperado
        const formattedData = data.map(item => ({
            CNPJ: item.CNPJ,
            NOME: item.Nome,
            QUANTIDADECUPONS: item.QuantidadeCupons,
            DATAHORA: item.DataHora,
        }));

        // Retorna os dados formatados como JSON
        res.json(formattedData);
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        res.status(500).json({ error: 'Erro ao buscar dados no MongoDB' });
    } finally {
        await client.close(); // Fecha a conexão com o MongoDB
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em ${port}`);
});
