const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// ================= MYSQL RAILWAY =================
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: Number(process.env.MYSQLPORT), // ⚠️ Railway trả về string nên phải đổi sang Number
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test kết nối khi server khởi động
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL Railway lỗi:", err);
    } else {
        console.log("✅ MySQL Railway connected!");
        connection.release();
    }
});


// ================= ROUTES =================

// Trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// API lưu RSVP
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


// API xem danh sách khách (có mật khẩu)
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


// Route kiểm tra server sống (Railway rất thích route này)
app.get('/health', (req, res) => {
    res.send("OK");
});


// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

// ⚠️ QUAN TRỌNG cho Railway: phải listen 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server chạy trên cổng ${PORT}`);
});
