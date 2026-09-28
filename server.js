import { error } from 'console';
import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import * as line from '@line/bot-sdk';
import Omise from 'omise';



const app = express();
const port = 3000;
const __dirname = import.meta.dirname;
const lineConfig = {
    channelAccessToken: '7oiJ3rpc4E8yE0d84XtYzruPViZ9VoNv8JzxROujGapYKuDjr1HOaFfWovPr4DcS58QHogyQgJ5xxaRlJxaLksshiaZKQ3isf/T5cGECQ32s4LhwJXCQMmHtYt1A+jaxBA4zQOkcxv5XrgErdaIajgdB04t89/1O/w1cDnyilFU='
};
const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.channelAccessToken
});
const omise = Omise({
    secretKey: 'skey_test_68sbflmnoyj3nc8dvfs',
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
            return res.status(500).json({error : err.message });
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
            return res.status(500).json({error : err.message});

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
            return res.status(500).json({error : err.message});
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
            return res.status(500).json({error : err.message});
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
            return res.status(500).json({error : err.message});
        } else{
            if (result.length>0) {
                res.json(result);
            } else {
                res.status(400).json({message : 'ไม่พบผู้ใช้'});
            }
        }
    })
})

app.put('/api/processWaste/', async (req, res) => {
    const {booking_id, items} = req.body;
    if (!booking_id || !items) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน'});
    }

    const sql = "SELECT user_id FROM booking WHERE booking_id = ?";
    db.query(sql, [booking_id], async (err, result) =>{
        if (err) {
            return res.status(500).json({error : err.message});
        }
        const userId = result[0].user_id;
        
        const getPrice = "SELECT * FROM waste_types";
        db.query(getPrice, async (error, priceResult) =>{
            if (error) {
                return res.status(500).json({error : error.message});
            }

            const wasteprice = {};
            priceResult.forEach(row =>{
                wasteprice[row.waste_name] = row.price_per_kg;
            });

            let totalPrice = 0;
            let wasteMessage = "สรุปรายการรับซื้อขยะ Rebin\n";
            items.forEach(item => {
                const price = wasteprice[item.waste_type];
                const total = price * parseFloat(item.weight);

                totalPrice += total;
                wasteMessage += `- ${item.waste_type}: ${item.weight} กก. (${total.toFixed(2)} บาท)\n`;
            });
            wasteMessage += `\nราคารวมทั้งหมด: ${totalPrice.toFixed(2)} บาท`;

            const insert = items.map(item => {
                const PricePerKg = wasteprice[item.waste_type];
                const priceTotal = PricePerKg * parseFloat(item.weight);
                return [booking_id, item.waste_type, PricePerKg, parseFloat(item.weight), priceTotal];
            });

            const insertSQL = "INSERT INTO book_detail(book_id, waste, price_per_kg, weigth, total_price) VALUES ?";
            db.query(insertSQL, [insert], async (err, insertResult) =>{
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                const UpdateBalance = "UPDATE user SET wallet_balance = wallet_balance + ? WHERE userid = ?";
                db.query(UpdateBalance, [totalPrice, userId], async (err, balanceResult) =>{
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    const UpdateStatus = "UPDATE booking SET status = 'completed' WHERE booking_id = ?";
                    db.query(UpdateStatus, [booking_id], (err, statusResult) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
        
                        const FineLineId = "SELECT lineID FROM user WHERE userid = ?";
                        db.query(FineLineId, [userId], async (err, lineResult) =>{
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }

                            if (lineResult.length > 0 && lineResult[0].lineID) {
                                const LineId = lineResult[0].lineID;

                                try {
                                    await client.pushMessage({
                                        to: LineId,
                                        messages:[
                                            {
                                                type: 'text',
                                                text: wasteMessage,
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
                            return res.json({
                                message: 'ประมวลผลรับซื้อขยะและเพิ่มเงินเข้ากระเป๋าเรียบร้อย',
                                totalPrice: totalPrice
                            });
                        })
                    })
                })
            })
        })
    })
})

app.post('/api/update-line-id/', async (req, res ) => {
    const {userid,lineID} =req.body;
    
    if (!userid || !lineID) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    const sql = "UPDATE user SET lineID = ? WHERE userid = ?";
    db.query(sql, [lineID, userid], (err,result) => {
        if (err) {
            return res.status(500).json({error : err.message});
        }else{
            res.json({ message: 'บันทึก LINE ID สำเร็จ' });
        }
    })
})

app.post('/api/withdraw/', async (req,res) => {
    const {userid, namebank, accountnumber, accountname, amount}=req.body;

    try {
        const checkbalance = "SELECT wallet_balance FROM user WHERE userid = ? FOR UPDATE";
        db.query(checkbalance, [userid], (err, results) => {
            if (err) {
                console.error('Error ดึงข้อมูล',err);
                return res.status(500).json({error: err.message});
            }
            
            const user = results[0];
            const CurrentBalance = user.wallet_balance;

            if (CurrentBalance >= amount) {
                const updatebalance = "UPDATE user SET wallet_balance = wallet_balance - ? WHERE userid = ?";
                db.query(updatebalance, [amount, userid], (err, results) => {
                    if (err) {
                        console.error('ไม่สามารถอัปเดตจำนวนเงินได้ :',err);
                        return res.status(500).json({error : err.message});
                    } 
                    const transaction = "INSERT INTO transactions(user_id, amount, bank, account_number, account_name, status, created_at) VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())";
                    db.query(transaction, [userid, amount, namebank, accountnumber, accountname], async (err, result) => {
                        if (err) {
                            console.error('ไม่สามารถบันทึกประวัติการเงินได้ : ', err);
                            return res.status(500).json({error : err.message});
                        }
                        const transactionID = result.insertId;

                        omise.recipients.create({
                            name: accountname,
                            type: 'individual',
                            bank_account: {
                                brand: namebank,
                                number: accountnumber,
                                name: accountname,
                            }
                        }, (err,recipient) => {
                            if (err) {
                                console.error('สร้าง recipient ไม่ได้ : ', err);
                                return res.status(500).json({error : err.message});
                            }
                            const transfers = omise.transfers.create({
                                amount:amount*100,
                                recipient: recipient.id,
                            }, (err,transfers) => {
                                if (err) {
                                    console.error('สร้าง transfers ไม่ได้ : ', err);
                                    return res.status(500).json({error : err.message});
                                }
                                const updateTransfers = "UPDATE transactions SET omise_transfer_id = ?, status = ? WHERE id = ?";
                                let status;
                                if (transfers.paid === true) {
                                    status = 'SUCCESS'; 
                                } else {
                                    status = 'PENDING';
                                }
                                db.query(updateTransfers, [transfers.id, status, transactionID], async (err,results) =>{
                                    if (err) {
                                        console.error('ไม่สามารถส่งคำขอถอนเงินได้เงินได้ : ', err);
                                        return res.status(500).json({ error: err.message });
                                    } else{
                                        return res.json({
                                            success: true,
                                            message: 'ส่งคำขอถอนเงินเรียบร้อยแล้ว',
                                            transferId: transfers.id,
                                        });
                                    }
                                });
                            });
                        });
                    });
                
                });
                    
            } else{
                return res.status(400).json({ error: 'ยอดเงินคงเหลือไม่เพียงพอ' });
            }

        })
        
    } catch{

    }
})

app.post('/api/lineAlert/', async (req, res) => {
    const {booking_id} = req.body;

    if (!booking_id) {
        return res.status(500).json({error : 'ข้อมูลไม่ครบ'});
    }

    const sql = "SELECT * FROM booking WHERE booking_id = ?";
    db.query(sql, [booking_id], async (err,result) => {
        if (err) {
            console.error('DB :',err);
            return res.status(500).json({ error: err.message });
        }
        if (result.length > 0) {
            const findLineId = "SELECT lineID FROM user WHERE userid = ?";  
            const userid = result[0].user_id;
            db.query (findLineId, [userid], async (error, results) =>{
                if (error) {
                    console.error('DB :',error);
                    return res.status(500).json({ error: error.message });
                }
                
                if (results.length>0 && results[0].lineID) {
                    const LineId = results[0].lineID;

                    try {
                        await client.pushMessage({
                            to: LineId,
                            messages: [
                                {
                                    type: 'text',
                                    text: `เจ้าหน้าที่กำลังไปหาคุณ โปรดเตรียมขยะไว้ให้พร้อม`,
                                }
                            ]
                        })
                        console.log('ส่งการแจ้งเตือน Line เรียบร้อย');
                        return res.json({ message: 'ส่งการแจ้งเตือน Line เรียบร้อย' });
                    } catch (error) {
                        console.error('Error Line:', error.message);
                        return res.status(500).json({ error: error.message });
                    }
                } else {
                    return res.status(400).json({ error: 'ไม่พบข้อมูล LINE ID ของผู้ใช้งาน' });
                }
                
            });
        } else{
            console.error('ไม่พบข้อมูล');
            return res.status(400).json({ error: 'ไม่พบข้อมูล' });
        }
        
    });
})

app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
});