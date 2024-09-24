const express = require('express');
const Firebird = require('node-firebird');
const ini = require('ini');
const fs = require('fs');

const app = express();

// Ler as configurações do arquivo config.ini
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// Configurações do Firebird a partir do arquivo .ini
const options = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

// Senha de autenticação
const API_SECRET_PASSWORD = '123';

app.use(express.json()); // Para poder receber JSON no body da requisição

// Função para gravar ou atualizar dados
function dados(req, res) {
    const { CNPJ, Nome, QuantidadeCupons, DataHora, senha } = req.body;

    // Validação da senha
    if (senha !== API_SECRET_PASSWORD) {
        return res.status(403).json({ error: 'Acesso negado: senha inválida' });
    }

    // Validação dos campos obrigatórios
    if (!CNPJ || !Nome || !QuantidadeCupons || !DataHora) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    // Conectar ao banco Firebird
    Firebird.attach(options, function (err, db) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
        }

        // Verifica se o cliente já existe
        const sqlSelect = 'SELECT * FROM CLIENTES WHERE CNPJ = ?';
        db.query(sqlSelect, [CNPJ], function (err, result) {
            if (err) {
                db.detach();
                return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
            }

            if (result.length > 0) {
                // Se o cliente existe, atualiza o registro
                const sqlUpdate = `
                    UPDATE CLIENTES 
                    SET Nome = ?, QuantidadeCupons = ?, DataHora = ? 
                    WHERE CNPJ = ?`;

                db.query(sqlUpdate, [Nome, QuantidadeCupons, DataHora, CNPJ], function (err) {
                    db.detach();
                    if (err) {
                        return res.status(500).json({ error: 'Erro ao atualizar os dados do cliente' });
                    }
                    return res.json({ message: 'Cliente atualizado com sucesso!' });
                });
            } else {
                // Se o cliente não existe, insere um novo registro
                const sqlInsert = `
                    INSERT INTO CLIENTES (CNPJ, Nome, QuantidadeCupons, DataHora)
                    VALUES (?, ?, ?, ?)`;

                db.query(sqlInsert, [CNPJ, Nome, QuantidadeCupons, DataHora], function (err) {
                    db.detach();
                    if (err) {
                        return res.status(500).json({ error: 'Erro ao inserir os dados do cliente' });
                    }
                    return res.json({ message: 'Cliente inserido com sucesso!' });
                });
            }
        });
    });
}

// Rota para receber os dados dos cupons
app.post('/dados', dados);

const PORT = 7584;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
