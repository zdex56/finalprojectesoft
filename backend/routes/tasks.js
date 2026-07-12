const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Создать задачу
router.post('/', async (req, res) => {
  try {
    const { title, description, status, latitude, longitude } = req.body;
    const creatorId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Название задачи обязательно' });
    }

    const validStatuses = ['new', 'in_progress', 'done'];
    const finalStatus = validStatuses.includes(status) ? status : 'new';

    const result = await pool.query(
      `INSERT INTO tasks (creator_id, title, description, status, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [creatorId, title, description || null, finalStatus, latitude || null, longitude || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Список задач  getTasks
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT * FROM tasks
      WHERE (creator_id = $1 OR id IN (SELECT task_id FROM taskassignee WHERE user_id = $1))
    `;
    const params = [userId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Одна задача с деталями + список исполнителей
router.get('/:id', async (req, res) => {
  try {
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const assigneesResult = await pool.query(
      `SELECT users.id, users.email FROM taskassignee
       JOIN users ON taskassignee.user_id = users.id
       WHERE taskassignee.task_id = $1`,
      [req.params.id]
    );

    res.json({ ...taskResult.rows[0], assignees: assigneesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// изменить статус задачи 
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'in_progress', 'done'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

//редактирование задачи
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const validStatuses = ['new', 'in_progress', 'done'];

    if (!title) {
      return res.status(400).json({ error: 'Название задачи обязательно' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *`,
      [title, description || null, status || 'new', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.json(result.rows[0]);
  } 
  catch (err) 
  {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// добавить чела в задачу
router.post('/:id/assignees', async (req, res) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;

    const existing = await pool.query(
      'SELECT * FROM taskassignee WHERE task_id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже назначен на эту задачу' });
    }

    await pool.query(
      'INSERT INTO taskassignee (task_id, user_id) VALUES ($1, $2)',
      [taskId, userId]
    );

    res.status(201).json({ message: 'Исполнитель добавлен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// удалить другого чела 
router.delete('/:id/assignees/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    await pool.query(
      'DELETE FROM taskassignee WHERE task_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Исполнитель удалён' });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// удалить задачу (только создатель)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND creator_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена или вы не создатель' });
    }

    res.json({ message: 'Задача удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;