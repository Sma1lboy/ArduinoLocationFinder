const express = require('express');
const path = require('path');
const mysql = require('mysql');
const http = require('http');
//Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aa20021001',
    database: 'publicplaces',
});

db.connect(err => {
    if (err) throw err;
    console.log("Database connect!");
});
const app = express();

// app.get('/', (req,res)=> {
//     res.sendFile(__dirname + '/public/index.html');
// })
//Create a database
app.get('/createdb', (req, res) => {
    let sqlStr = 'CREATE DATABASE IF NOT EXISTS publicplaces';
    db.query(sqlStr, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Database created');
    });
});
//Create table
app.get('/createtable', (req, res) => {
    let sql = 'CREATE TABLE IF NOT EXISTS places (id int(100), name VARCHAR(100), numPeople INT(100), PRIMARY KEY (id))'
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Table created...');
    });
});
//Create a test example
app.get('/testunit1', (req, res) => {
    let example = { id: 1, name: 'library', numPeople: 233 };
    let sql = 'INSERT INTO places SET ?';
    let query = db.query(sql, example, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('example1');
    });
});
//Create a test2 example
app.get('/testunit2', (req, res) => {
    let example = { id: 2, name: 'bathroom', numPeople: 2 };
    let sql = 'INSERT INTO places SET ?';
    let query = db.query(sql, example, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('example2');
    });
});
//select all data
app.get('/select', (req, res) => {
    let sql = 'SELECT * FROM places';
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
        // console.log(result); test line
    });
});
//select single id
app.get('/select/:id', (req, res) => {
    let sql = `SELECT * FROM places WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        // console.log(result); test line
        res.send(result);
    });
});
//auto increment one
var numOfPeople = 0;
app.get('/increment/:id', (req, res) => {
    let sql = `SELECT * FROM places WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(`before change people in ${req.params.id} is ${result[0].numPeople}`)
        numOfPeople = result[0].numPeople + 1;
        console.log(`after change people in ${req.params.id} is ${numOfPeople}`)
        sql = `update places set numPeople=${numOfPeople} where id= ${req.params.id}`
        db.query(sql, (err, resultt) => {
            if(err) throw err;
            res.send(`add 1 person into id ${req.params.id}, the total number in ${result[0].name} is ${numOfPeople} now`);
        });
    });
});

//Recive data from serialport
const { SerialPort, ReadlineParser } = require('serialport')
const parser = new ReadlineParser();
const portName = process.argv[2] || "COM3";
const myPort = new SerialPort({
    path: portName,
    baudRate: 9600,
    // parser: serialPort.parsers.readline("\n"),
    autoOpen: false,
});
myPort.pipe(parser);

myPort.open();
myPort.on('open', () => {
    console.log('open connection to arduino');
});
//parsed data 
//reciving data
var numPeople = 0;
parser.on('data', async (data) => {
    console.log('received data!')
    let sql = `SELECT numPeople FROM places WHERE id = 1`;
    // get numPeople
    let query = db.query(sql, (err, result) => {
        if (err)
            throw err;
        numPeople = result[0].numPeople;
        console.log("people before " + numPeople);
        numPeople = numPeople + 1;
        console.log("people after " + numPeople);
        sql = `update places set numPeople=${numPeople} WHERE id=1`;
        let query2 = db.query(sql, (err, result) => {
            if (err) throw err;
        });
    });


    console.log(`works`);
});

//dependence on envirnment or default port 3000
const port = process.env.port || 3000;
// app.listen(port, () => console.log("Listening port " + port));
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');
    setInterval(function(){
        let sql = 'SELECT * FROM places';
        db.query(sql, (err, result) => {
        if (err) throw err;
            var data = result;
            io.emit('revData', data);
        });
      },2000);
   
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  });


server.listen(port, () => {
    console.log('listening on *:3000');
  });

app.use(express.static('public'));
process.on('uncaughtException', function (err) {
    console.log(err);
}); 
/*
Last update date 4/20/2022
*/
