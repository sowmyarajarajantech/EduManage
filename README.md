# 🎓 EduManage - Student Management System

**EduManage** is a robust, full-stack web application designed to manage student records, visualize academic performance, and generate administrative reports. It features a responsive dashboard, real-time data visualization using Chart.js, and role-based access control.

![EduManage Dashboard](public/screenshot.png)

---

## 🚀 Key Features

* **📊 Live Dashboard:** Real-time statistics on total students, average scores, and recent top performers.
* **📝 Student Management (CRUD):** Add, Edit, Delete, and View student profiles connected to a MySQL database.
* **🔍 Advanced Filtering:** Instant search by Name, Registration ID, Department, or Blood Group.
* **📈 Interactive Analytics (Chart.js):**

  * **Pie Chart:** Student distribution by Department.
  * **Bar Chart:** Average marks per Department (with **Year-based filtering**).
  * **Line Chart:** Student enrollment trends per Year.
* **⚙️ Settings & Tools:**

  * **Dark/Light Mode:** Theme toggling with local storage persistence.
  * **Role Management:** Switch between **Admin** (Full Access) and **Viewer** (Read-only) modes.
  * **CSV Export:** Download student data for offline use.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript (ES6+), Chart.js
* **Backend:** Node.js, Express.js
* **Database:** MySQL (Relational Database)
* **Dev Tools:** MySQL Workbench, Postman

---

## ⚙️ Prerequisites

Before running the project, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v14 or higher)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

---

## 📥 Installation & Setup

### 1. Clone the Repository

Download or clone the project folder to your local machine:

```bash
git clone https://github.com/your-username/edumanage.git
cd edumanage
```

### 2. Install Dependencies

Install the required backend packages (Express, MySQL2, CORS, etc.):

```bash
npm install
```

### 3. Database Configuration

1. Open **MySQL Workbench**.
2. Open the file `college_data.sql` located in the root directory.
3. Click the ⚡ (Lightning Bolt) icon to execute the script.

This will:

* Create the `school_db` database
* Populate it with dummy student data

### 4. Connect Server to Database

Open the `server.js` file and locate the database connection block. Update the password field with your MySQL root password:

```js
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD', // <--- REPLACE THIS
    database: 'school_db'
});
```

### 5. Run the Application

Start the Node.js server:

```bash
node server.js
```

You should see the message:

```
✅ Connected to MySQL
```

### 6. Access the Dashboard

Open your web browser and navigate to:

```
http://localhost:3000
```

---

## 📂 Project Structure

```plaintext
/edumanage
│
├── public/                # Static Frontend Assets
│   ├── index.html         # Main UI Structure
│   ├── style.css          # Styling, Themes, & Responsive Design
│   └── script.js          # Frontend Logic, API Calls, Chart Rendering
│
├── server.js              # Node.js Express Server & API Routes
├── college_data.sql       # Database Import Script
├── package.json           # Project Dependencies & Config
├── .gitignore             # Files to ignore (node_modules, etc.)
└── README.md              # Project Documentation
```

---

## 🔌 API Endpoints

| Method | Endpoint            | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | `/api/students`     | Retrieve all student records    |
| POST   | `/api/students`     | Add a new student record        |
| PUT    | `/api/students/:id` | Update an existing student      |
| DELETE | `/api/students/:id` | Delete a student record         |
| POST   | `/api/reset`        | Reset database to initial state |

---

## 📌 Notes

* This project is intended for **educational and academic use**.
* Role-based access is handled on the frontend for demonstration purposes.
* Can be extended with authentication (JWT), pagination, and deployment.

---

## 👩‍💻 Author

**EduManage – Student Management System**
Built as a full‑stack academic project using Node.js and MySQL.
