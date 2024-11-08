function main(){
    let nome = document.getElementById('nome').value
    let pass = document.getElementById('senha').value
    
    if (nome = 'admin' && pass == 'trigominas') {
        window.location.href = './tabela/tabela.html'
    } else {
        alert('usuário incorreto')
    }

}