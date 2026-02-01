const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


// ================= MYSQL POOL (TỰ RECONNECT) =================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("🟡 Đang kết nối MySQL...");

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
  } else {
    console.log("✅ MySQL Railway connected!");
    connection.release();
  }
});


// ================= ROUTE TEST SERVER =================
app.get('/', (req, res) => {
  res.send("💍 Wedding Server đang chạy ngon lành 🎉");
});


// ================= API NHẬN RSVP =================
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
      console.error("❌ Lỗi lưu RSVP:", err);
      return res.status(500).send("Lỗi lưu dữ liệu");
    }

    res.send("✅ Đã lưu xác nhận tham dự!");
  });
});


// ================= API XEM DANH SÁCH KHÁCH (CÓ MẬT KHẨU) =================
app.get('/guests', (req, res) => {
  const password = req.query.pass;

  if (password !== "bunscho") {
    return res.status(403).send("⛔ Không có quyền truy cập");
  }

  db.query("SELECT * FROM guests ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error(err);
      return res.json([]);
    }

    res.json(results);
  });
});


// ================= CHẠY SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server chạy trên cổng " + PORT);
});

