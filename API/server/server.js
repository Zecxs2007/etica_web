const express = require('express');
const Firebird = require('node-firebird');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 9834;

// Permite que o frontend (public/index.js) faça requisições para o backend
app.use(cors());

// Configurações de conexão com o Firebird
const options = {
    host: '10.100.141.1', 
    port: 3050,        
    database: path.join(__dirname, '../DADOS.FDB'),
    user: 'SYSDBA',
    password: 'masterkey',
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

// Endpoint para buscar dados
app.get('/dados', (req, res) => {
    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error('Erro ao conectar ao banco:', err);
            return res.status(500).json({ error: 'Erro de conexão com o banco' });
        }

        // Consulta ao banco
        db.query('SELECT * FROM CLIENTES', (err, result) => {
            if (err) {
                console.error('Erro na consulta:', err);
                res.status(500).json({ error: 'Erro ao buscar dados' });
            } else {
                // Loga os dados no console do servidor
                console.log('Dados recebidos do banco de dados Firebird:', result);

                // Envia os dados como resposta JSON para o frontend
                res.json(result);
            }

            db.detach(); // Fecha a conexão
        });
    });
});

// Inicia o servidor na porta 3000
app.listen(port, () => {
    console.log(`Servidor rodando em ${port}`);
});
