# Sobre o projeto
  Esse projeto a principio visa buscar informações dos cupons acumulados para estar mostrando na web em tempo real e nós dando uma melhor visualização dos clientes, mas com o passar do tempo foi percebido que essa tecnologia tem mais potencial do que somente buscar essa simples informação do cliente, e nós vamos melhorar essa aplicação e melhorar a experiencia dos funcionarios da Ética e possivelmente dos clientes também.
## Desenvolvimentos concluidos
  1. Busca cupons
     - Projeto inicial que tem uma API em uma maquina virtual que busca informações dos cupons acumulados dos clientes com o aplicativo instalado e coloca no site.
     - O aplicativo tem a opção de mudar de quanto em quanto tempo é atualizado, em geral é feita a atualização de 1 em 1 hora para não pesar no computador do cliente.
     - O site é uma tabela simples, mas bem indentada, com opção de busca por Nome, Cnpj e quantidade de cupons.
     - Há uma tela de login inicial para que somente o pessoal da empresa possa logar no site.
## Desenvolvimentos não concluidos
  2. Chamados
     - Esse projeto visa pegar os atendimentos do ctrl f12 do sistema e colocar na web.
  3. Cadastro de clientes
     - Esse projeto visa pegar todos os cadastros de clientes do nosso sistema e colocar na web.
     - Também temos uma ideia de colocar a data de instalação de cada computador.
# Ajudas
1. Trazer dados para o computador
   - primeiramente você deve ter o mongodb e o mongodb tools instalado na sua maquina, segue os links de download
     - https://www.mongodb.com/try/download/community
     - https://www.mongodb.com/try/download/database-tools
        - Lembre se de marcar a opção *Package msi*
   - Após isso você deve colocar o mongo tools no PATH do windows
     - localizar onde foi criado a pasta tools, por padrão fica em `C:\Program Files\MongoDB\Tools\100\bin`
     - Após você vai apertar `win + s` e pesquise por "Váriaveis de ambiente"
     - Agora é só apertar novamente em "váriaveis de ambiente"
     - Depois disso vá em "Path" e aperte em editar
     - depois aperte em "Novo" e coloque o caminho do Mongo tools
   - Agora você vai abrir o cmd e navegar até o diretório do projeto e escrever o seguinte código:
     - mongorestore --db etica ./backup/etica
