import express from 'express';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

admin.initializeApp({
    credential: admin.credential.cert("serviceAccountKey.json")
});

const firestore = admin.firestore();

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(join(__dirname, 'public')));

app.get('/cliente', async (req, res) => {
    const cnpjQuery = req.query.cnpj;
    const nomeQuery = req.query.nome;
    let dados;

    if (cnpjQuery) {
        // Filtra os dados pelo CNPJ parcialmente
        dados = (await firestore.collection('CLIENTES')
            .where('CNPJ_CPF', '>=', cnpjQuery)
            .where('CNPJ_CPF', '<=', cnpjQuery + '\uf8ff')  // \uf8ff é o caractere mais alto no Unicode
            .get()).docs.map(doc => ({
            ...doc.data(),
            uid: doc.id
        }));
    } else if (nomeQuery) {
        // Filtra os dados pelo nome parcialmente
        dados = (await firestore.collection('CLIENTES')
            .where('NOME', '>=', nomeQuery)
            .where('NOME', '<=', nomeQuery + '\uf8ff')
            .get()).docs.map(doc => ({
            ...doc.data(),
            uid: doc.id
        }));
    } else {
        // Obtém todos os dados se nenhum CNPJ ou nome for pesquisado
        dados = (await firestore.collection('CLIENTES').get()).docs.map(doc => ({
            ...doc.data(),
            uid: doc.id
        }));
    }

    const data = dados.reduce((acc, doc) => acc + `
    <tr>
        <td>${doc.ID}</td>
        <td>${doc.NOME}</td>
        <td>${doc.CNPJ_CPF}</td>
        <td>${doc.CUPONS_ACUMULADOS}</td>
        <td>${new Date(doc.lastUpdated.seconds * 1000).toLocaleDateString()}</td>
        <td>${new Date(doc.lastUpdated.seconds * 1000).toLocaleTimeString()}</td>
    </tr>`, '');

    const response = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pesquisa por CNPJ ou Nome</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        <div id="label">
            <form action="/cliente" method="get">
                <label for="cnpj">Pesquisar por CNPJ:</label>
                <input type="text" id="cnpj" name="cnpj" placeholder="Digite o CNPJ">
                <br>
                <label for="nome">Pesquisar por Nome:</label>
                <input type="text" id="nome" name="nome" placeholder="Digite o Nome">
                <br>
                <button type="submit">Pesquisar</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nome</th>
                        <th>CNPJ</th>
                        <th>Cupons</th>
                        <th>Data Última atualização</th>
                        <th>Hora atualização</th>
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
