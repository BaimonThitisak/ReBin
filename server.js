import { error } from 'console';
import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import * as line from '@line/bot-sdk';

// const line = require('@line/bot-sdk');
// const mysql = require('mysql2');
// const path = require('path');

const app = express();
const port = 3000;
const __dirname = import.meta.dirname;
const lineConfig = {
    channelAccessToken: '7oiJ3rpc4E8yE0d84XtYzruPViZ9VoNv8JzxROujGapYKuDjr1HOaFfWovPr4DcS58QHogyQgJ5xxaRlJxaLksshiaZKQ3isf/T5cGECQ32s4LhwJXCQMmHtYt1A+jaxBA4zQOkcxv5XrgErdaIajgdB04t89/1O/w1cDnyilFU='
};
const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.channelAccessToken
});

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
app.get('/admindashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'admindashboard.html'));
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
        console.error("เชื่อม DB ไม่ได้", err);
    }
    console.log("เชื่อม DB แล้ว!!")
})



app.post('/api/signUp', async (req, res) => {
    const {username, password, firstname, lastname, email} = req.body;

    const sql = "INSERT INTO user(username, password, firstname, lastname, email) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [username, password, firstname, lastname, email], (err, results) => {
        if (err) {
            console.error("ไม่สามารถบันทึกได้ : ",err);
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


app.post('/api/booking/', async (req, res) => {
    const {user_id, name, date, time, latitude, longitude, phone} = req.body;

    const sql = "INSERT INTO booking(user_id, name, date, time, latitude, longitude, phone, booking_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
    db.query(sql, [user_id, name, date, time, latitude, longitude, phone], (err,results) => {
        if (err) {
            console.error('ไม่สามารถบันทึกการจองได้ : ', err);
            res.status(500).json({error : err.message});

        } else {
            res.json({message: 'บันทึกการจองเรียบร้อยแล้ว'});
        }
    } )
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const sqlfineline = "SELECT lineID FROM user WHERE userid = ?";
    db.query(sqlfineline, [user_id], async (err,results) => {
        if (err) {
            console.error('DB : ',err);
        }
        if (results.length > 0 && results[0].lineID) {
            const LineId = results[0].lineID;

            try {
                await client.pushMessage({
                    to: LineId,
                    messages:[
                        {
                            type: 'text',
                            text: `จองคิวนัดหมายสำเร็จ\nข้อมูลการนัดหมาย\nชื่อผู้นัด : ${name}\nวันที่นัด : ${date}\nเวลาที่นัด : ${time}\nเบอร์ผู้นัด : ${phone}\nสถานที่นักหมาย : ${googleMapsLink}\nเมื่อใกล้ถึงเวลานัดเจ้าหน้าที่จะแจ้งให้ทราบอีกที!!!`,
                        }
                    ]
                })
                console.log("ส่งแจ้งเตือน LINE สำเร็จ!");
            } catch (errorLine) {
                console.error("Error การแจ้งเตือน Line:", errorLine.message);
            }

        } else {
            console.log("ผู้ใช้ยังไม่ได้ผูกบัญชี LINE");
        }
    })

})
app.get('/api/price/', async (req, res) => {
    const sql = "SELECT * FROM waste_types";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('ไม่สามารถดึงข้อมูลราคาขยะได้');
        } else {
            res.json(results);
        }
    })
})

app.get('/api/user/:id', async (req, res) => {
    
    const user_id = req.params.id;
    const sql = "SELECT * FROM user WHERE userid = ?";
    db.query(sql, [user_id] , (err,result) =>{
        if (err) {
            console.error('ไม่สารมารถดึงข้อมูลกระเป๋าตังได้ : ', err);
            res.status(500).json({error : err.message});
        } else{
            if (result.length>0) {
                res.json(result[0]);
            } else {
                res.status(400).json({message : 'ไม่พบผู้ใช้'});
            }
        }
    })
})

app.get('/api/bookdetail/:id', async (req, res) => {
    
    const user_id = req.params.id;
    const sql = "SELECT * FROM booking WHERE user_id = ?";
    db.query(sql, [user_id] , (err,result) =>{
        if (err) {
            console.error('ไม่สารมารถดึงข้อมูลกระเป๋าตังได้ : ', err);
            res.status(500).json({error : err.message});
        } else{
            if (result.length>0) {
                res.json(result);
            } else {
                res.status(400).json({message : 'ไม่พบผู้ใช้'});
            }
        }
    })
})
app.get('/api/bookdetail/', async (req, res) => {
    
    const sql = "SELECT * FROM booking";
    db.query(sql, (err,result) =>{
        if (err) {
            console.error('ไม่สารมารถดึงข้อมูลกระเป๋าตังได้ : ', err);
            res.status(500).json({error : err.message});
        } else{
            if (result.length>0) {
                res.json(result);
            } else {
                res.status(400).json({message : 'ไม่พบผู้ใช้'});
            }
        }
    })
})

app.post('/api/processWaste/', async (req, res) => {

})

app.post('/api/update-line-id/', async (req, res ) => {
    const {userid,lineID} =req.body;
    
    if (!userid || !lineID) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    const sql = "UPDATE user SET lineID = ? WHERE userid = ?";
    db.query(sql, [lineID, userid], (err,result) => {
        if (err) {
            res.status(500).json({error : err.message});
        }else{
            res.json({ message: 'บันทึก LINE ID สำเร็จ' });
        }
    })
})


app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
});