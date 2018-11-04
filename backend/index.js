var app = require('express')();
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
let parser = require('body-parser');
let router = require('./routes');
const pub_router = require('./routes/pub_router');
const mongoose = require('mongoose');
const userModel = require('./models/user');
const bcrypt = require('bcrypt-nodejs');
const login = require('./routes/login')({userModel: userModel});

mongoose.connect('mongodb://localhost/spatialplanner').then(
    () => {console.log("MongoDB connection success");},
    (error) => {console.log("MongoDB connection failure:"+error);}
);

app.use(cors());

app.use(parser.json());

app.get("/users", login.getUsers());
app.post("/register", login.register());
app.post("/login", login.login());
app.post("/logout", login.logout());

app.use("/api", login.isUserLogged, router);
app.use("/", pub_router);

io.on('connection', function(client) {
    console.log('a user connected');
    client.emit('message', 'Hello!');
    client.on('subscribe to messages', (interval) => {
        console.log('client is subscribing to messages with interval ', interval);
        setInterval(() => {
            client.emit('message', new Date());
        }, interval);
    });
});

//app.listen(3001);
http.listen(3001);

console.log("Running at port 3001");
