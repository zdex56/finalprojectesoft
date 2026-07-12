const authRoutes = require('./routes/auth');
const pool = require('./db');
const express = require('express');
const app = express();
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is healthy');
});

app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
});

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

app.listen(5005, () => {
  console.log('Server running on http://localhost:5005');
});