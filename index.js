const engines = require('consolidate');
const express = require('express');

const app = express();

app.engine('html', engines.mustache); app.set('view engine', 'html');
app.set('views', __dirname + '/views');+

app.use(express.static(__dirname + '/views'));

const port = 3000

const clients = {};

app.get('/', (req, res) => {
    res.render('index.html');
})

const server = app.listen(port, () => {
    console.log(`Executando no servidor em http://localhost:${port}`)
})

const io = require('socket.io')(server);

io.on("connection", function (client) {
    client.on("join", function(name){
        console.log(`${name} entrou`);
        clients[client.id] = name;
        client.emit("update", "Você se conectou ao nosso chat.");
        client.broadcast.emit("update", name + " foi adicionado ao servidor.")
    });

    client.on("send", function(msg){
        console.log("Mensagem Enviada: " + msg);
        client.broadcast.emit("chat", clients[client.id], msg);
    });

    client.on("disconnect", function(){
        console.log("Desconectado");
        io.emit("update", clients[client.id] + " saiu do servidor.");
        delete clients[client.id];
    });
});