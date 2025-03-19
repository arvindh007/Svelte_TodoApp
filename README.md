# To-Do App

A simple To-Do application built using **Svelte** for the frontend and **Express + MySQL** for the backend. This app allows users to create, update, delete, and filter their tasks, with a feature to mark tasks as completed.

## Features

- ✅ **Create, Read, Update, and Delete (CRUD) Todos**
- ✅ **Mark tasks as completed** with a checkbox
- ✅ **Strikethrough styling** for completed tasks
- ✅ **Filter tasks** (All, Completed, Incomplete)
- ✅ **Responsive UI** built with Svelte
- ✅ **MySQL Database Integration**

## Tech Stack

### **Frontend**
- Svelte
- Fetch API for backend communication
- CSS for styling

### **Backend**
- Express.js
- MySQL (with `mysql2` package)
- CORS & dotenv for environment configuration

---

## Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/todo-app.git
cd todo-app
```

### **2. Setup the Backend**
```bash
cd backend
npm install
```

#### **2.1 Configure Environment Variables**
Create a `.env` file inside the `backend/` folder and add:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=todos_db
```


#### **2.2 Start the Backend Server**
```bash
node server.js
```

### **3. Setup the Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Usage

1. Open `http://localhost:5173/` (or the port where Vite serves the frontend)
2. Add new tasks using the form
3. Click on the checkbox to mark a task as completed
4. Use the dropdown to filter tasks (All, Completed, Incomplete)
5. Click on a task to view details or edit it
6. Click the delete button to remove a task

---

## API Endpoints

| Method | Endpoint      | Description |
|--------|-------------|-------------|
| GET    | `/todos`     | Fetch all todos |
| GET    | `/todos/:id` | Fetch a single todo by ID |
| POST   | `/todos`     | Create a new todo |
| PUT    | `/todos/:id` | Update an existing todo (including completion status) |
| DELETE | `/todos/:id` | Delete a todo |

---

## Future Improvements 🚀
- 🔹 User authentication (login/logout)
- 🔹 Due date for tasks with reminders
- 🔹 Drag-and-drop for task prioritization

---

## License
This project is open-source and free to use under the MIT license.

---

## Author
👨‍💻 Developed by **Arvindh S V**

---

