const express = require('express');
const mysql = require("mysql2");
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// KẾT NỐI MYSQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL lỗi:", err);
  } else {
    console.log("✅ MySQL Railway connected");
  }
});


// API NHẬN RSVP
app.post('/rsvp', (req, res) => {
  const { name, phone, email, attending, message } = req.body;

  const sql = "INSERT INTO guests (name, phone, email, attending, message) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, phone, email, attending, message], (err) => {
    if (err) {
      console.log(err);
      res.send("Lỗi lưu dữ liệu");
    } else {
      res.send("Đã lưu lại xác nhận!");
    }
  });
});


// API LẤY DANH SÁCH KHÁCH
app.get('/guests', (req, res) => {
  db.query("SELECT * FROM guests", (err, results) => {
    if (err) {
      res.json([]);
    } else {
      res.json(results);
    }
  });
});   // ✅ ĐÓNG app.get Ở ĐÂY


// CHẠY SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server chạy trên cổng " + PORT);
});
