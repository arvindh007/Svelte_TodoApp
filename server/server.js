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
  
  // Add completed and completed_at columns to todos table if they don't exist
  db.query(`
    ALTER TABLE todos 
    ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL
  `, (err) => {
    if (err) {
      console.error('Error adding completed columns:', err);
    } else {
      console.log('Completed columns added or already exist');
    }
  });

  // Create todo_updates table if it doesn't exist
  db.query(`
    CREATE TABLE IF NOT EXISTS todo_updates (
      id INT PRIMARY KEY AUTO_INCREMENT,
      todo_id INT NOT NULL,
      update_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating todo_updates table:', err);
    } else {
      console.log('Todo updates table ready');
    }
  });
});

// Get all todos
app.get('/todos', (req, res) => {
  db.query(
    `SELECT *, 
      DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at,
      DATE_FORMAT(completed_at, "%Y-%m-%dT%H:%i:%s.000Z") as completed_at 
     FROM todos 
     ORDER BY created_at DESC`, 
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: err.message });
      }
      res.json(results);
    }
  );
});

// Get single todo with updates
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  db.query(`
    SELECT 
      t.*,
      DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
      DATE_FORMAT(t.completed_at, '%Y-%m-%dT%H:%i:%s.000Z') as completed_at,
      IFNULL(
        (
          SELECT CONCAT('[', GROUP_CONCAT(
            JSON_OBJECT(
              'id', tu.id,
              'text', tu.update_text,
              'date', DATE_FORMAT(tu.created_at, '%Y-%m-%dT%H:%i:%s.000Z')
            )
          ), ']')
          FROM todo_updates tu
          WHERE tu.todo_id = t.id
          ORDER BY tu.created_at DESC
        ),
        '[]'
      ) as updates
    FROM todos t
    WHERE t.id = ?
  `, [id], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: err.message });
    }
    if (results.length === 0) return res.status(404).json({ message: 'Todo not found' });
    
    // Parse the updates string to JSON array
    const todo = results[0];
    try {
      todo.updates = JSON.parse(todo.updates);
    } catch (e) {
      todo.updates = [];
    }
    
    res.json(todo);
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
      db.query(
        `SELECT *, 
         DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at,
         DATE_FORMAT(completed_at, "%Y-%m-%dT%H:%i:%s.000Z") as completed_at 
         FROM todos WHERE id = ?`, 
        [result.insertId], 
        (err, rows) => {
          if (err) return res.status(500).json({ message: err.message });
          res.status(201).json(rows[0]);
        }
      );
    }
  );
});

// Update todo
app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;
  
  if (!title) return res.status(400).json({ message: 'Title is required' });

  db.query(
    'UPDATE todos SET title = ?, description = ? WHERE id = ? AND completed = false',
    [title, description || '', id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Todo not found or already completed' });
      
      // Fetch the updated todo
      db.query(
        `SELECT *, 
         DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at,
         DATE_FORMAT(completed_at, "%Y-%m-%dT%H:%i:%s.000Z") as completed_at 
         FROM todos WHERE id = ?`, 
        [id], 
        (err, rows) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json(rows[0]);
        }
      );
    }
  );
});

// Delete todo
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  
  db.query(
    'DELETE FROM todos WHERE id = ? AND completed = false',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Todo not found or already completed' });
      res.json({ message: 'Todo deleted successfully' });
    }
  );
});

// Complete todo
app.patch('/todos/:id/complete', (req, res) => {
  const id = req.params.id;
  
  db.query(
    'UPDATE todos SET completed = true, completed_at = CURRENT_TIMESTAMP WHERE id = ? AND completed = false',
    [id],
    (err, result) => {
      if (err) {
        console.error('Error completing todo:', err);
        return res.status(500).json({ message: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Todo not found or already completed' });
      }
      
      // Fetch the updated todo with updates
      db.query(`
        SELECT 
          t.*,
          DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
          DATE_FORMAT(t.completed_at, '%Y-%m-%dT%H:%i:%s.000Z') as completed_at,
          IFNULL(
            (
              SELECT CONCAT('[', GROUP_CONCAT(
                JSON_OBJECT(
                  'id', tu.id,
                  'text', tu.update_text,
                  'date', DATE_FORMAT(tu.created_at, '%Y-%m-%dT%H:%i:%s.000Z')
                )
              ), ']')
              FROM todo_updates tu
              WHERE tu.todo_id = t.id
              ORDER BY tu.created_at DESC
            ),
            '[]'
          ) as updates
        FROM todos t
        WHERE t.id = ?
      `, [id], (err, results) => {
        if (err) {
          console.error('Error fetching updated todo:', err);
          return res.status(500).json({ message: err.message });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ message: 'Todo not found' });
        }

        // Parse the updates string to JSON array
        const todo = results[0];
        try {
          todo.updates = JSON.parse(todo.updates);
        } catch (e) {
          todo.updates = [];
        }
        
        res.json(todo);
      });
    }
  );
});

// Add update to todo
app.post('/todos/:id/updates', (req, res) => {
  const { id } = req.params;
  const { update } = req.body;

  if (!update || !update.trim()) {
    return res.status(400).json({ message: 'Update text is required' });
  }

  // First check if todo exists and is not completed
  db.query('SELECT completed FROM todos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Todo not found' });
    if (results[0].completed) return res.status(400).json({ message: 'Cannot add updates to completed todos' });

    // If todo exists and is not completed, add the update
    db.query(
      'INSERT INTO todo_updates (todo_id, update_text) VALUES (?, ?)',
      [id, update],
      (err) => {
        if (err) {
          console.error('Error adding update:', err);
          return res.status(500).json({ message: 'Failed to add update' });
        }

        // Return the updated todo with all its updates
        db.query(`
          SELECT 
            t.*,
            DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
            DATE_FORMAT(t.completed_at, '%Y-%m-%dT%H:%i:%s.000Z') as completed_at,
            IFNULL(
              (
                SELECT CONCAT('[', GROUP_CONCAT(
                  JSON_OBJECT(
                    'id', tu.id,
                    'text', tu.update_text,
                    'date', DATE_FORMAT(tu.created_at, '%Y-%m-%dT%H:%i:%s.000Z')
                  )
                ), ']')
                FROM todo_updates tu
                WHERE tu.todo_id = t.id
                ORDER BY tu.created_at DESC
              ),
              '[]'
            ) as updates
          FROM todos t
          WHERE t.id = ?
        `, [id], (err, results) => {
          if (err) {
            console.error('Error fetching updated todo:', err);
            return res.status(500).json({ message: 'Failed to fetch updated todo' });
          }
          
          if (results.length === 0) {
            return res.status(404).json({ message: 'Todo not found' });
          }

          // Parse the updates string to JSON array
          const todo = results[0];
          try {
            todo.updates = JSON.parse(todo.updates);
          } catch (e) {
            todo.updates = [];
          }
          
          res.json(todo);
        });
      }
    );
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
