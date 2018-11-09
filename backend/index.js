var app = require('express')();
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
let parser = require('body-parser');
let router = require('./routes')(io);
const pub_router = require('./routes/pub_router');
const mongoose = require('mongoose');
const userModel = require('./models/user');
const bcrypt = require('bcrypt-nodejs');
const login = require('./routes/login')({userModel: userModel});

let port;
if (process.env.MONGODB_USER) {
    // Heroku + MongoDB Atlas
    console.log("At Heroku");
    let user = process.env.MONGODB_USER;
    let url = 'mongodb+srv://' + user + '@cluster0-fbtbl.mongodb.net';
    mongoose.connect(url, {dbName: 'spatialplanner'}).then(
        () => {console.log("MongoDB connection success");},
        (error) => {console.log("MongoDB connection failure:"+error);}
    );
    port = process.env.PORT;
} else {
    mongoose.connect('mongodb://localhost/spatialplanner').then(
        () => {console.log("MongoDB connection success");},
        (error) => {console.log("MongoDB connection failure:"+error);}
    );
    port = 3001;
}

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
    client.on('subscribe to channel', (channel) => {
        console.log('client is subscribing to channel ', channel);
        client.join(channel);
    });
});

http.listen(port);

console.log("Listening on port "+port);
