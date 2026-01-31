const express = require('express');
const mysql = require("mysql2");

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
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// K?T N?I MYSQL




// API NH?N RSVP
app.post('/rsvp', (req, res) => {
  const { name, phone, email, attending, message } = req.body;

  const sql = "INSERT INTO guests (name, phone, email, attending, message) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, phone, email, attending, message], (err) => {
    if (err) {
      console.log(err);
      res.send("L?i luu d? li?u");
    } else {
      res.send("?? Ðã luu l?i xác nh?n!");
    }
  });
});

app.get('/guests', (req, res) => {
  db.query("SELECT * FROM guests", (err, results) => {
    if (err) {
      res.json([]);
    } else {
      res.json(results);
    }
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server chạy trên cổng " + PORT);
});





