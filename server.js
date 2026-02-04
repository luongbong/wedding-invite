const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ KẾT NỐI MYSQL RAILWAY ĐÚNG BIẾN MÔI TRƯỜNG
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL Railway lỗi:", err);
    } else {
        console.log("✅ MySQL Railway connected!");
        connection.release();
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/rsvp', (req, res) => {
    const { name, phone, email, attending, message } = req.body;

    if (!name || !attending) {
        return res.status(400).send("Thiếu tên hoặc trạng thái tham dự");
    }

    const sql = `INSERT INTO guests (name, phone, email, attending, message)
                 VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [name, phone || null, email || null, attending, message || null], (err) => {
        if (err) {
            console.error("❌ Lỗi lưu RSVP:", err);
            return res.status(500).send("Lỗi lưu dữ liệu");
        }
        res.send("✅ Đã lưu xác nhận tham dự!");
    });
});

app.get('/guests', (req, res) => {
    if (req.query.pass !== "admin123") {
        return res.status(403).send("⛔ Không có quyền truy cập");
    }

    db.query("SELECT * FROM guests ORDER BY id DESC", (err, results) => {
        if (err) {
            console.error("❌ Lỗi lấy danh sách:", err);
            return res.status(500).json([]);
        }
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server chạy trên cổng ${PORT}`);
});
