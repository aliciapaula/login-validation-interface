//Requisições
const express = require('express'); //Framework HTTP/Web
const bodyParser = require('body-parser'); //Middleware
const mysql = require('mysql2'); //Conector MySQL
const bcryptjs = require('bcryptjs'); // Criptografia da senha

//Variaveis de ambiente
const app = express(); //Atribue os recursos do express a variavel app
const port = 3003; //Port onde o servidor ouvira as requisições do tipo HTTP

//Conexão ao banco de dados 
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'loginDB'
});

//Tratamento 
db.getConnection(err => {
    if(err){
        console.log('Erro ao conectar com a base de dados: ' + err.message);
    } else{
        console.log('Conectado ao banco de dados MySQL');
    }
});

//Middlewares
app.use(bodyParser.json()); //Lida com req e res do tipo JSON
app.use(bodyParser.urlencoded({extended:true})); //Realiza uma analise do formulário
app.use(express.static('public')); //Define o diretório estatico do projeto

//Aponta a url '/register' para o arquivo 'register.html'
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html')
});

app.post('/register', async(req, res) => {
    const {name, username, password} = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);

    const sql = 'INSERT INTO users (name, username, password) VALUES (?, ?, ?)';
    db.query(sql, [name, username, hashedPassword], (err, result) => {
        if(err){
            console.error('Erro ao registrar o usuário: ' + err.message);
            res.status(500).send('Erro ao registrar usuario.')
        }else{
            console.log('Usuário registrado com sucesso!');
            res.redirect('/login');
        }
    });
});

//Aponta a url '/login' para o arquivo 'login.html'
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async(err, result) =>  {
        if(err){
            console.error('Erro ao buscar usuario:' + err.message);
            res.status(500).send('Erro ao buscar usuario!');
        }else{
            if(result.length === 0){
                res.status(401).send('Usuario não encontrado');
            } else{
                const match = await bcryptjs.compare(password, result[0].password);
                if(match){
                    res.sendFile(__dirname + '/page.html');
                }else{
                    res.status(401).send('Senha incorreta!');
                }
            }
        }
    });
});

//Sair da página principal
app.get('/page', (req, res) => {
    res.sendFile(__dirname + 'page.html');
});

app.post('/page', (req, res) =>{
    res.redirect('/login')
});

//Inicia o servido web
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
});



