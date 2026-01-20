/**
 * BACKEND SERVER
 * Connects to the static data in MySQL
 */
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 1. Connect to the existing data
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@1234', 
    database: 'college_db'
});

db.connect(err => {
    if (err) console.error('❌ Connection Failed:', err.message);
    else console.log('✅ Connected to MySQL (Using static data from school_data.sql)');
});

// 2. Simple API Routes
app.get('/api/students', (req, res) => {
    db.query("SELECT * FROM students ORDER BY created_at DESC", (err, rows) => {
        if(err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/students', (req, res) => {
    const { id, name, registration_number, department, blood_group, year, average_marks } = req.body;
    const sql = "INSERT INTO students (id, name, registration_number, department, blood_group, year, average_marks) VALUES (?,?,?,?,?,?,?)";
    db.query(sql, [id, name, registration_number, department, blood_group, year, average_marks], (err) => {
        if(err) return res.status(400).json({error: err.message});
        res.json({message: "Success"});
    });
});

app.put('/api/students/:id', (req, res) => {
    const { name, registration_number, department, blood_group, year, average_marks } = req.body;
    const sql = "UPDATE students SET name=?, registration_number=?, department=?, blood_group=?, year=?, average_marks=? WHERE id=?";
    db.query(sql, [name, registration_number, department, blood_group, year, average_marks, req.params.id], (err) => {
        if(err) return res.status(400).json({error: err.message});
        res.json({message: "Updated"});
    });
});

app.delete('/api/students/:id', (req, res) => {
    db.query("DELETE FROM students WHERE id=?", [req.params.id], (err) => {
        if(err) return res.status(400).json({error: err.message});
        res.json({message: "Deleted"});
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));