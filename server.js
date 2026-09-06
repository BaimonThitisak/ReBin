const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

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
app.get('/admindashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'admindashboard.html'));
});
//

app.use('/Style', express.static(path.join(__dirname, 'Style')));
app.use('/img', express.static(path.join(__dirname, 'img')));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ReBin"
})

db.connect((err) => {
    if (err) {
        console.error("เชื่อม DB ไม่ได้", err);
    }
    console.log("เชื่อม DB แล้ว!!")
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
            message: "สมัครสมาชิกเรียบร้อย" 
        });
    })
})

app.post('/api/signIn/', async (req, res) =>{
    const {username, password} =req.body;

    const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        
        if (results.length > 0) {
            const user = results[0];
            res.json({ 
                message: "เข้าสู่ระบบเรียนร้อย",
                user: user
            });

        } else {
            res.status(401).json({message : "ไม่สามารถเข้าสู่ระบบได้ "})
        }

    })
})


app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
});