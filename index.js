const express = require('express')
const app = express()
const port = 3000
const config = require('./config')

var mysql = require('mysql')
var connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
})

// connection.connect()
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected as id ' + connection.threadId);
});

connection.query(
    `SELECT * FROM averoaco_one.pengguna;
    `
    , function (err, rows, fields) {
  if (err) throw err
  app.get('/', (req, res) => {
    return res.send(rows);
  });
  // console.log(rows)
})

connection.end()

app.get('/tes', (req, res) => {
    return res.send('tes');
  });

// app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))