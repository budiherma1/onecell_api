const express = require('express')
const app = express()
const port = 3000
const config = require('./config')
var cors = require('cors')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

var mysql = require('mysql');
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

app.get('/a', (req, res) => {
    return res.send('wwwwwwww');
});
// end testing

// app.post('/login', jsonParser, (req, res) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     var username = req.body.username
//     var password = req.body.password
//     connection.query(
//         `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`
//         , function (err, rows, fields) {
//             if (err) {
//                 return res.send(err);
//             }

//             if (rows.length > 0) {
//                 return res.status(200).send({ status: 200, data: rows })
//             } else {
//                 return res.status(400).send({ status: 400, data: {message: 'Username and password did not match'} })
//             }
            
//         })
// });

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
        `SELECT penjualan_id, product, price, note, status, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at, updated_at FROM penjualan WHERE status = 1 ORDER BY created_at DESC;`
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
// 
// NEW APP

// login
app.post('/login', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var username = req.body.username
    var password = req.body.password
    connection.query(
        `SELECT * FROM averoaco_one.users a
        left join (
        SELECT config_id, config, value, note, group_id, status, created_by, created_at, updated_at, 
        group_concat(if(config = 'target_penjualan_nett', value, null)) as target_penjualan_nett,
        group_concat(if(config = 'target_penjualan_bruto', value, null)) as target_penjualan_bruto,
        group_concat(if(config = 'shop_name', value, null)) as shop_name 
        FROM averoaco_one.config
        where status = 1
        ) b on a.group_id = b.group_id
        
        where username = '${username}'
        and password = '${password}'
        and b.status = 1;`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            if(rows.length > 0) {
                return res.status(200).send({ status: 200, data: rows })
            } else {
                return res.status(404).send({ status: 404, data: 'Data Not Found' })
            }
        })
});

// target status
app.post('/status-target', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT sum(price) as total FROM averoaco_one.penjualan
        where status = 1
        and group_id = ${group_id}
        and (is_pulsa = 0 || is_pulsa is null)
        and date_format(created_at, '%Y-%m') = date_format(curdate(), '%Y-%m')`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            return res.status(200).send({ status: 200, data: rows })
        })
});

// uang aksesoris sekarang
app.post('/uang-aksesoris', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT sum(price) as total FROM averoaco_one.penjualan
        where status = 1
        and group_id = ${group_id}
        and is_stored = 0
        and (is_pulsa = 0 || is_pulsa is null)`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            // if(rows[0].total != null) {
                return res.status(200).send({ status: 200, data: rows })
            // } else {
            //     return res.status(404).send({ status: 404, data: 'Data Not Found' })
            // }
        })
});

// uang pulsa sekarang
app.post('/uang-pulsa', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT sum(price) as total FROM averoaco_one.penjualan
        where status = 1
        and group_id = ${group_id}
        and is_stored = 0
        and is_pulsa = 1`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            // if(rows[0].total != null) {
                return res.status(200).send({ status: 200, data: rows })
            // } else {
            //     return res.status(404).send({ status: 404, data: rows })
            // }
        })
});

// total penjualan perhari, 10 hari terakhir
app.post('/penjualan-per-hari', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT group_id,
        sum(price) as total, DATE_FORMAT(created_at,'%Y-%m-%d') as date
         FROM averoaco_one.penjualan
         where group_id = ${group_id}
         and status = 1
         and (is_pulsa = 0 || is_pulsa is null)
         group by DATE_FORMAT(created_at,'%Y-%m-%d')
         order by created_at desc
         limit 10`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            if(rows.length > 0) {
                return res.status(200).send({ status: 200, data: rows })
            } else {
                return res.status(404).send({ status: 404, data: 'Data Not Found' })
            }
        })
});

// Produk terlaris
app.post('/top-product', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT product, product_id, count(penjualan_id) as total FROM averoaco_one.penjualan
        where status = 1
        and group_id = ${group_id}
        and (is_pulsa = 0 || is_pulsa is null)
        group by product_id
        order by count(penjualan_id) desc limit 10`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            if(rows.length > 0) {
                return res.status(200).send({ status: 200, data: rows })
            } else {
                return res.status(404).send({ status: 404, data: 'Data Not Found' })
            }
        })
});

// Produk Type
app.get('/product-type', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT * FROM averoaco_one.products
        where status = 1
        and group_id = ${group_id}`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            if(rows.length > 0) {
                return res.status(200).send({ status: 200, data: rows })
            } else {
                return res.status(404).send({ status: 404, data: 'Data Not Found' })
            }
        })
});

// Insert new produk
app.post('/new-products', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var product = req.body.product
    var product_type = req.body.product_type
    var stock = req.body.stock
    var buy_price = req.body.buy_price
    var sell_price = req.body.sell_price
    var note = req.body.note
    var created_by = req.body.created_by
    var group_id = req.body.group_id
    connection.query(
        `INSERT INTO products (product, product_type, stock, buy_price, sell_price, note, created_by, group_id) VALUES ('${product}', '${product_type}', '${stock}', '${buy_price}', '${sell_price}', '${note}', '${created_by}', '${group_id}');`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(201).send({ status: 201, data: rows })
        })
});

// penjualan hari ini
app.post('/penjualan-hari-ini', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT penjualan_id, product, product_id, price, note, status, is_pulsa, group_id, is_stored, created_by, date_format(created_at, '%H:%i') as created_at, updated_at FROM averoaco_one.penjualan
        where status = 1
        and group_id = ${group_id}
        -- and (is_pulsa = 0 || is_pulsa is null)
        and date_format(created_at, '%Y-%m-%d') = date_format(curdate(), '%Y-%m-%d')
        order by created_at desc
        `
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            return res.status(200).send({ status: 200, data: rows })
        })
});

// penjualan bulan ini
app.post('/penjualan-bulan-ini', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT penjualan_id, product, product_id, price, note, status, is_pulsa, group_id, is_stored, created_by, date_format(created_at, '%d-%m, %H:%i') as created_at, updated_at FROM averoaco_one.penjualan
        where status = 1
        and group_id = ${group_id}
        -- and (is_pulsa = 0 || is_pulsa is null)
        and date_format(created_at, '%Y-%m') = date_format(curdate(), '%Y-%m')
        order by created_at desc
        `
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            return res.status(200).send({ status: 200, data: rows })
        })
});

// new-penjualan
app.post('/new-penjualan', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var product = req.body.product
    var product_id = req.body.product_id
    var is_pulsa = req.body.is_pulsa
    var harga_beli = req.body.harga_beli
    var group_id = req.body.group_id
    var created_by = req.body.created_by
    var price = req.body.price
    var note = req.body.note
    var created_at = req.body.created_at
    connection.query(
        `INSERT INTO penjualan (status, product, price, note ${created_at ? ', created_at' : ''}, product_id, is_pulsa, harga_beli, group_id, created_by) VALUES (1,'${product}', '${price}', '${note}'${created_at ? ",'"+created_at+"'" : ''},'${product_id}','${is_pulsa}','${harga_beli}','${group_id}','${created_by}');`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }
            return res.status(201).send({ status: 201, data: rows })
        })
});

// Laba total
app.post('/laba-total', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT 
        sum(price-harga_beli) as total 
        -- penjualan_id, product, product_id, price, note, status, is_pulsa, harga_beli, group_id, is_stored, created_by, created_at, updated_at, price-harga_beli as aa
        FROM averoaco_one.penjualan
                where status = 1
                and group_id = ${group_id}
                -- and (is_pulsa = 0 || is_pulsa is null)
                -- is_pulsa = 1
                and date_format(created_at, '%Y-%m') = date_format(curdate(), '%Y-%m')`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            return res.status(200).send({ status: 200, data: rows })
        })
});

// Laba aksesoris
app.post('/laba-aksesoris', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT 
        sum(price-harga_beli) as total 
        -- penjualan_id, product, product_id, price, note, status, is_pulsa, harga_beli, group_id, is_stored, created_by, created_at, updated_at, price-harga_beli as aa
        FROM averoaco_one.penjualan
                where status = 1
                and group_id = ${group_id}
                and (is_pulsa = 0 || is_pulsa is null)
                -- is_pulsa = 1
                and date_format(created_at, '%Y-%m') = date_format(curdate(), '%Y-%m')`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            return res.status(200).send({ status: 200, data: rows })
        })
});

// Laba Pulsa
app.post('/laba-pulsa', jsonParser, (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var group_id = req.body.group_id
    connection.query(
        `SELECT 
        sum(price-harga_beli) as total 
        -- penjualan_id, product, product_id, price, note, status, is_pulsa, harga_beli, group_id, is_stored, created_by, created_at, updated_at, price-harga_beli as aa
        FROM averoaco_one.penjualan
                where status = 1
                and group_id = ${group_id}
                -- and (is_pulsa = 0 || is_pulsa is null)
                and is_pulsa = 1
                and date_format(created_at, '%Y-%m') = date_format(curdate(), '%Y-%m')`
        , function (err, rows, fields) {
            if (err) {
                return res.send(err);
            }

            return res.status(200).send({ status: 200, data: rows })
        })
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))