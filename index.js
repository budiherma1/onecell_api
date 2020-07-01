const express = require('express')
const app = express()
const port = 3000

var mysql = require('mysql')
var connection = mysql.createConnection({
  host: '103.146.203.15',
  user: 'averoaco_one',
  password: 'nananina17',
  database: 'averoaco_one'
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

// app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))