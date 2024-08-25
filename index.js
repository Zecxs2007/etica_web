import express from 'express';
import admin from 'firebase-admin';

const app = express();

admin.initializeApp({
    credential: admin.credential.cert("serviceAccountKey.json")
});

const firestore = admin.firestore();

app.use(express.json());
app.use(express.static('public'));

app.get('/cliente', async (req, res) => {
    console.log('GET dados');
    
    const { searchColumn, searchQuery } = req.query;
    let query = firestore.collection('CLIENTES');
    
    if (searchColumn && searchQuery) {
        query = query.where(searchColumn, '>=', searchQuery)
                     .where(searchColumn, '<=', searchQuery + '\uf8ff');
    }
    
    const dados = (await query.get()).docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
    }));
    console.log(dados);

    // Construir a string HTML para a tabela
    const data = dados.reduce((acc, doc) => acc + `
        <tr>
            <td>${doc.ID}</td>
            <td>${doc.NOME}</td>
            <td>${doc.CNPJ_CPF}</td>
            <td>${doc.CUPONS_ACUMULADOS}</td>
            <td>${new Date(doc.lastUpdated.seconds * 1000).toLocaleDateString()}</td>
            <td>${new Date(doc.lastUpdated.seconds * 1000).toLocaleTimeString()}</td>
        </tr>
    `, '');

    const response = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" href="style.css">
            <script src="index.js" defer></script>
        </head>
        <body>
            <div id="search-container">
                <form id="search-form">
                    <label for="search-column">Coluna:</label>
                    <select id="search-column" name="searchColumn">
                        <option value="ID">ID</option>
                        <option value="NOME">Nome</option>
                        <option value="CNPJ_CPF">CNPJ</option>
                    </select>
                    <label for="search-query">Buscar:</label>
                    <input type="text" id="search-query" name="searchQuery">
                    <button type="submit">Pesquisar</button>
                </form>
            </div>
            <div id="label">
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Nome</th>
                            <th>CNPJ</th>
                            <th>Cupons</th>
                            <th>Data Última Atualização</th>
                            <th>Hora Atualização</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data}
                    </tbody>             
                </table>
            </div>
        </body>
        </html>
    `;
    res.send(response);
});

app.listen(3000, () => console.log('API rest foi iniciada em http://localhost:3000'));
