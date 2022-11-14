/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Task } from '../models/task.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const status = req.query.status as Task['status'];
  const filter: Partial<Task> = { userId: res.locals.user.id };
  if (status) {
    filter.status = status === 'open' ? 'open' : 'done';
  }
  const tasks = (await taskDAO.findAll(filter)).map(task => {
    return { ...task, title: cryptoService.decrypt(task.title), description: cryptoService.decrypt(task.description) };
  });
  res.json({ results: tasks });
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const createdTask = await taskDAO.create({
    userId: res.locals.user.id,
    title: cryptoService.encrypt(req.body.title),
    dueDate: '',
    description: '',
    status: 'open'
  });
  res.status(201).json({
    ...createdTask,
    title: cryptoService.decrypt(createdTask.title),
    description: cryptoService.decrypt(createdTask.description)
  });
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const task = await taskDAO.findOne({ id: req.params.id });
  if (!task) {
    res.status(404).json({ message: `Es existiert keine Aufgabe mit der ID ${req.params.id}` });
  } else {
    res.status(200).json({
      ...task,
      title: cryptoService.decrypt(task.title),
      description: task.description ? cryptoService.decrypt(task.description) : ''
    });
  }
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;

  const partialTask: Partial<Task> = { id: req.params.id };
  if (cryptoService.encrypt(req.body.title)) {
    partialTask.title = cryptoService.encrypt(req.body.title);
  }
  if (req.body.dueDate) {
    partialTask.dueDate = req.body.dueDate;
  }
  if (cryptoService.encrypt(req.body.description || '')) {
    partialTask.description = cryptoService.encrypt(req.body.description || '');
  }
  if (req.body.status) {
    partialTask.status = req.body.status;
  }

  await taskDAO.update(partialTask);
  res.status(200).end();
});

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  await taskDAO.delete(req.params.id);
  res.status(200).end();
});

export default router;
