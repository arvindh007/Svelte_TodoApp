const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todos_db'
});

// error handling for database connection
db.connect(err => {
  if (err) {
    console.error('MySQL Connection Error:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


// Get all todos
app.get('/todos', (req, res) => {
  db.query('SELECT * FROM todos ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: err.message });
    }
    res.json(results);
  });
});

// Get single todo
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM todos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Todo not found' });
    res.json(results[0]);
  });
});

// Create todo
app.post('/todos', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  db.query(
    'INSERT INTO todos (title, description) VALUES (?, ?)',
    [title, description || ''],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      
      // Fetch the created todo
      db.query('SELECT * FROM todos WHERE id = ?', [result.insertId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json(rows[0]);
      });
    }
  );
});

// Update todo
app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;
  
  if (!title) return res.status(400).json({ message: 'Title is required' });

  db.query(
    'UPDATE todos SET title = ?, description = ? WHERE id = ?',
    [title, description || '', id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Todo not found' });
      
      // Fetch the updated todo
      db.query('SELECT * FROM todos WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows[0]);
      });
    }
  );
});

// Delete todo
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  
  db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted successfully' });
  });
});

// Toggle todo completion status
app.patch('/todos/:id/toggle', (req, res) => {
  const id = req.params.id;
  
  db.query(
    'UPDATE todos SET completed = NOT completed WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Todo not found' });
      
      // Fetch the updated todo
      db.query('SELECT * FROM todos WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows[0]);
      });
    }
  );
});

app.post('/todos/:id/updates', (req, res) => {
  const { id } = req.params;
  const { update } = req.body;

  db.query(
    'INSERT INTO todo_updates (todo_id, update_text) VALUES (?, ?)',
    [id, update],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });

      // Return the updated todo with all its updates
      db.query(
        `SELECT t.*, 
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'text', tu.update_text,
              'date', tu.created_at
            )
          ) as updates
        FROM todos t
        LEFT JOIN todo_updates tu ON t.id = tu.todo_id
        WHERE t.id = ?
        GROUP BY t.id`,
        [id],
        (err, results) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json(results[0]);
        }
      );
    }
  );
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
