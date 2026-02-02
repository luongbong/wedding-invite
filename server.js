const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== MySQL Pool (Railway Auto Variables) =====
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test kết nối khi server khởi động
console.log("🟡 Đang kết nối MySQL...");

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err.message);
  } else {
    console.log("✅ MySQL Railway connected!");
    connection.release();
  }
});

// ===== ROUTE TRANG CHỦ =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== API NHẬN RSVP =====
app.post('/rsvp', (req, res) => {
  const { name, phone, email, attending, message } = req.body;

  if (!name || !attending) {
    return res.status(400).send("Thiếu tên hoặc trạng thái tham dự");
  }

  const sql = `
    INSERT INTO guests (name, phone, email, attending, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    name,
    phone || null,
    email || null,
    attending,
    message || null
  ], (err) => {
    if (err) {
      console.error("❌ Lỗi lưu RSVP:", err.message);
      return res.status(500).send("Lỗi lưu dữ liệu");
    }

    res.send("✅ Đã lưu xác nhận tham dự!");
  });
});

// ===== API XEM DANH SÁCH KHÁCH =====
app.get('/guests', (req, res) => {
  const password = req.query.pass;

  if (password !== "admin123") {
    return res.status(403).send("⛔ Không có quyền truy cập");
  }

  db.query("SELECT * FROM guests ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error("❌ Lỗi lấy danh sách:", err.message);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

// ===== BẮT LỖI KHÔNG CHO APP CRASH =====
process.on('uncaughtException', err => {
  console.error('🔥 Uncaught Exception:', err.message);
});

process.on('unhandledRejection', err => {
  console.error('🔥 Unhandled Rejection:', err.message);
});

// ===== START SERVER (QUAN TRỌNG CHO RAILWAY) =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server chạy trên cổng ${PORT}`);
});
