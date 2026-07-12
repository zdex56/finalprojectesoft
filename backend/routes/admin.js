const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// поиск пользователей по email (пусто — вернёт всех)
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, email, role FROM users';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ' WHERE email ILIKE $1';
    }

    query += ' ORDER BY email';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// все задачи конкретного чела — и где он создатель, и где исполнитель
router.get('/users/:id/tasks', async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE creator_id = $1
          OR id IN (SELECT task_id FROM taskassignee WHERE user_id = $1)
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// изменить роль чела (сделать админом  или убрать)
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'неверная роль' });
    }

    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'нельзя изменить свою собственную роль' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// редактировать эмеил пользователя
router.patch('/users/:id', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    const result = await pool.query(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email, role',
      [email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'этот email уже занят' });
    }
    res.status(500).json({ error: 'оошибка сервера' });
  }
});

// Удалить пользователя
router.delete('/users/:id', async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'н ельзя удалить самого себя' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id,]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'пользователь не найден' });
    }

    res.json({ message: 'пользователь удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ошибка сервера' });
  }
});

// удалить задачу будучи админом
router.delete('/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id',
      [req.params.id,]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'задача не найдена' });
    }

    res.json({ message: 'задача удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;