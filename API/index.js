const express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs');

const app = express();
const port = 7584;

const uri = 'mongodb://127.0.0.1:27017'; // URI do MongoDB
const client = new MongoClient(uri);
const dbName = 'etica'; // Nome do banco de dados

// Senha de autenticação
const API_SECRET_PASSWORD = 'trigominas2025';

app.use(express.json()); // Para receber JSON no body da requisição

// Função para conectar ao MongoDB
async function connectMongo() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB');
        return client.db('etica');
    } catch (error) {
        console.error('Erro ao conectar:', error);
        throw error;
    }
}

// Função para gravar ou atualizar dados
async function dados(req, res) {
    const { CNPJ, Nome, QuantidadeCupons, DataHora, senha } = req.body;

    // Validação da senha
    if (senha !== API_SECRET_PASSWORD) {
        return res.status(403).json({ error: 'Acesso negado: senha inválida' });
    }

    // Validação dos campos obrigatórios
    if (!CNPJ || !Nome || !DataHora) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    try {
        const db = await connectMongo();
        const collection = db.collection('clientes'); // Nome da coleção

        // Verifica se o cliente já existe
        const existingClient = await collection.findOne({ CNPJ });
        if (existingClient) {
            // Atualiza o cliente se já existir
            await collection.updateOne(
                { CNPJ },
                { $set: { Nome, QuantidadeCupons, DataHora } }
            );
            return res.json({ message: 'Cliente atualizado com sucesso!' });
        } else {
            // Insere o cliente se não existir
            await collection.insertOne({ CNPJ, Nome, QuantidadeCupons, DataHora });
            return res.json({ message: 'Cliente inserido com sucesso!' });
        }
    } catch (error) {
        console.error('Erro ao gravar ou atualizar os dados:', error);
        return res.status(500).json({ error: 'Erro ao processar os dados' });
    }
}

// Rota para receber os dados dos cupons
app.post('/dados', dados);

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
