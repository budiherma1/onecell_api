const express = require('express')
const app = express()
const port = 3000
const config = require('./config')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

var mysql = require('mysql')

function handleDisconnect() {
    connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    })
    connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// testing
app.get('/', (req, res) => {
    connection.query(
        `SELECT * FROM pengguna;`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            res.send(rows);
        })

});

app.post('/aaa', jsonParser, (req, res) => {
    return res.send(req.body);
});
// end testing


app.get('/products', (req, res) => {
    connection.query(
        `SELECT * FROM products;`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 200, data: rows })
        })
});

app.get('/products/:id', (req, res) => {
    connection.query(
        `SELECT * FROM products where product_id = ${req.params.id};`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 200, data: rows })
        })
});

app.post('/products', jsonParser, (req, res) => {
    var product = req.body.product
    var product_type = req.body.product_type
    var stock = req.body.stock
    var buy_price = req.body.buy_price
    var sell_price = req.body.sell_price
    connection.query(
        `INSERT INTO penjualan (product, product_type, stock, buy_price, sell_price) VALUES ('${product}', '${product_type}', '${stock}', '${buy_price}', '${sell_price}');`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(201).send({ status: 201, data: rows })
        })
});

app.get('/penjualan', (req, res) => {
    connection.query(
        `SELECT * FROM penjualan;`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 200, data: rows })
        })
});

app.post('/penjualan', jsonParser, (req, res) => {
    var product = req.body.product
    var price = req.body.price
    var note = req.body.note
    connection.query(
        `INSERT INTO penjualan (product, price, note) VALUES ('${product}', '${price}', '${note}');`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(201).send({ status: 201, data: rows })
        })
});

app.delete('/penjualan/:id', jsonParser, (req, res) => {

    connection.query(
        `UPDATE penjualan SET status = 0 WHERE penjualan_id = ${req.params.id};`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 201, data: rows })
        })
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))