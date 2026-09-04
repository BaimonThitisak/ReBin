const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ReBin'
})

db.connect((err) => {
    if (err) {
        console.error("failed to connect DB!", err);
    }
    console.log("Connect DB Successfully!")
})

// app.post('/api/signIn', (req, res)=> {
//     const {firstname, lastname} = req.body;

// });

app.post('/api/signUp', (req, res) => {
    const {username, password, firstname, lastname, email} = req.body;

    const query = "INSERT INTO user(username, password, firstname, lastname, email) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [username, password, firstname, lastname, email], (err, results) => {
        if (err) {
            console.error("Insert Failed : ",err);
            res.status(500).json({error : err.message });
        }

        res.json({
            message: "registration is complete." 
        });
    })
})

app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
});