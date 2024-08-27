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
});

app.listen(3000, () => console.log('API rest foi iniciada em http://localhost:3000'));
