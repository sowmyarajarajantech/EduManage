/**
 * ONE-TIME TOOL: SQL FILE GENERATOR
 * Run this: 'node create_sql_dump.js'
 * Result: It creates 'school_data.sql' with 600+ hardcoded students.
 */

const fs = require('fs');

const depts = ["Computer Science", "Electrical", "Mechanical", "Civil", "Architecture", "Aeronautical", "IT", "Business", "Biomedical", "Communications"];
const bloods = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

// 1. Start the SQL File content
let sqlContent = `-- STUDENT DASHBOARD DATABASE DUMP
-- Generated Static Data: 10 Depts x 4 Years x 15 Students = 600 Total

CREATE DATABASE IF NOT EXISTS college_db;
USE college_db;

DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    year INT NOT NULL,
    average_marks FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (id, name, registration_number, department, blood_group, year, average_marks) VALUES 
`;

// 2. Loop to generate 600 students
const values = [];
let regCounter = 1000;

// Helper to create UUID
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

depts.forEach(dept => {
    for (let year = 1; year <= 4; year++) {
        for (let i = 0; i < 15; i++) {
            regCounter++;
            const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${fname} ${lname}`;
            const id = uuid();
            const reg = `REG-${regCounter}`;
            const blood = bloods[Math.floor(Math.random() * bloods.length)];
            const marks = (Math.random() * 60 + 40).toFixed(1);

            // Create the SQL string for this row
            values.push(`('${id}', '${name}', '${reg}', '${dept}', '${blood}', ${year}, ${marks})`);
        }
    }
});

// 3. Join all values and end the statement
sqlContent += values.join(",\n") + ";\n";

// 4. Write to file
fs.writeFileSync('college_data.sql', sqlContent);
console.log("✅ SUCCESS: 'college_data.sql' has been created with 600 students!");