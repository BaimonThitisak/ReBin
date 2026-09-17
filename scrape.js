import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import mysql from 'mysql2';

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

async function getWastePrice() {
    
    const selectWaste = ['พลาสติกรวม', 'แก้วขาว','แก้วแดง','แก้วรวม', 'กระดาษลัง', 'อลูมิเนียมกระป๋อง 1 kg. ขึ้นไป', 'อลูมิเนียมเพลท', 'ท่อ PVC ฟ้า', 'ลวด', 'เหล็กรวม - ม้วนกลม', 'เหล็กหนาสั้น', 'เหล็กหนายาว', 'เหล็กบาง - ตะปู', 'สแตนเลส (ชิ้นใหญ่)', 'สแตนเลสแท้ 304 (ชิ้นเล็ก)', 'ตะกั่ว - จั๊บ แกะไม่ติด'];

    try {
        const response = await fetch('https://www.ทําลายเอกสารฟรี.com/price');
        const body = await response.text();
        const $ = cheerio.load(body);

        // const wrapper = $('td[data-label="ประเภท"]');
        // console.log(wrapper.body);

        const item = [];
        $('tr').map((i, el) => {
            const wasteName = $(el).find('td[data-label="ประเภท"]').text().trim();
            const wastePrice = $(el).find('td[data-label="ราคารับซื้อ"]').text().trim();
            // console.log('ชื่อขยะ: ${wastename} | ราคารับซื้อ: ${wasteprice}');
            // console.log(wasteprice);
            if (selectWaste.includes(wasteName)) {

                item.push({
                    wasteName,wastePrice
                })

                
                const sql = 'UPDATE waste_types SET price_per_kg = ?, update_at = NOW() WHERE waste_name = ?';
                db.query(sql, [wastePrice, wasteName], (err, results) => {
                    if (err) {
                        console.error('ไม่สามารถบันทึกราคาขยะได้ : ',err);
                    } 

                })
            }
            
        });
        console.log(item);
        console.log('บันทึกราคาขยะเรียบร้อย');
        db.end();
        
        

    } catch (error) {
        console.log(error);
    }


}

getWastePrice();