const express = require('express')
const app = express()
const port = 3000
const config = require('./config')
var cors = require('cors')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

var mysql = require('mysql')

app.use(cors({origin:true,credentials: true}));
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

app.post('/login', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var username = req.body.username
    var password = req.body.password
    connection.query(
        `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            if (rows.length > 0) {
                return res.status(200).send({ status: 200, data: rows })
            } else {
                return res.status(400).send({ status: 400, data: {message: 'Username and password did not match'} })
            }
            
        })
});

app.get('/products', (req, res) => {
    var product_type = req.query.product_type ? `WHERE product_type = '${req.query.product_type}'` : ''
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    connection.query(
        `SELECT * FROM products ${product_type};`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 200, data: rows })
        })
});

app.get('/products/jenis', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    connection.query(
        `SELECT product_type FROM products GROUP BY product_type;`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 200, data: rows })
        })
});

app.get('/products/:id', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    connection.query(
        `SELECT * FROM penjualan WHERE status = 1 ORDER BY created_at DESC;`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 200, data: rows })
        })
});

// var corsOptionsDelegate = function (req, callback) {
//     var corsOptions;
//     // if (whitelist.indexOf(req.header('Origin')) !== -1) {
//     //   corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
//     // } else {
//       corsOptions = { origin: false } // disable CORS for this request
//     // }
//     callback(null, corsOptions) // callback expects two parameters: error and options
//   }

app.post('/penjualan', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var product = req.body.product
    var price = req.body.price
    var note = req.body.note
    var date = req.body.date
    connection.query(
        `INSERT INTO penjualan (status, product, price, note, created_at) VALUES (1,'${product}', '${price}', '${note}','${date}');`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(201).send({ status: 201, data: rows })
        })
});

app.delete('/penjualan', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var penjualan_id = req.body.penjualan_id
    connection.query(
        `UPDATE penjualan SET status = 0 WHERE penjualan_id IN (${penjualan_id});`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(200).send({ status: 200, data: rows })
        })
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))