const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());


app.use('/Style', express.static(path.join(__dirname, 'Style')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// เชื่อมหน้า
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'Frontend','signin.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'signup.html'));
});
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'main.html'));
});
app.get('/price', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'price.html'));
});
app.get('/wallet', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'wallet.html'));
});
app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'booking.html'));
});
//
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ReBin"
})

db.connect((err) => {
    if (err) {
        console.error("failed to connect DB!", err);
    }
    console.log("Connect DB Successfully!")
})



app.post('/api/signUp', async (req, res) => {
    const {username, password, firstname, lastname, email} = req.body;

    const sql = "INSERT INTO user(username, password, firstname, lastname, email) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [username, password, firstname, lastname, email], (err, results, fields) => {
        if (err) {
            console.error("Insert Failed : ",err);
            res.status(500).json({error : err.message });
        }

        res.json({
            message: "registration is complete." 
        });
    })
})

app.get('/api/signIn/', async (req, res) =>{
    const {username} =req.body;

    const sql = "SELECT * FROM user WHERE username = ? "
    db.query(sql, [username], (err, results, fields) => {
        
        if (results.length > 0) {
            res.json({ message: "เข้ารู้ระบบเรียนร้อย"});
        } else {
            res.status(401).json({message : "ไม่สามารถเข้าสู่ระบบได้ "})
        }

    })
})


app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
});