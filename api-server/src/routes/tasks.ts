/* Autor: Pascal Thesing (FH Münster) */

import express from "express";
import { Task } from "../models/tasks/task";
import { GenericDAO } from "../models/generic.dao";
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.post('/', authService.authenticationMiddleware, async (req, res) => {
    const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
    const errors: string[] = [];

    const sendErrorMessage = (message: string) => {
        res.status(400).json({ message });
    };

    if (!hasRequiredFields(req.body, ['name',  'description', 'taskType', 'muscle'], errors)) {
        return sendErrorMessage(errors.join('\n'));
    }

    const task = await taskDAO.create({
        name: req.body.name,
        description: req.body.description,
        pictures: req.body.pictures,
        taskType: req.body.taskType,
        muscle: req.body.muscle
    })
    res.status(201).json(task);
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const errors: string[] = [];

  const sendErrorMessage = (message: string) => {
      res.status(400).json({ message });
  };

  if (!hasRequiredFields(req.body, ['id', 'name',  'description', 'taskType', 'muscle'], errors)) {
      return sendErrorMessage(errors.join('\n'));
  }

  const task = await taskDAO.update({
      id: req.body.id,  
      name: req.body.name,
      description: req.body.description,
      pictures: req.body.pictures,
      taskType: req.body.taskType,
      muscle: req.body.muscle
  })
  res.status(201).json(task);
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
    const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;

    const tasks = await taskDAO.findAll();
    res.status(201).json({ results: tasks})
})

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const task = await taskDAO.findOne({ id: req.params.id });

  res.status(200).json({ data: task })
})


router.delete('/:id', authService.authenticationMiddleware, async (req, res) => { 
    const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  await taskDAO.delete(req.params.id);
  res.status(200).end(); 
});

function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
    let hasErrors = false;
    requiredFields.forEach(fieldName => {
      if (!object[fieldName]) {
        errors.push(fieldName + ' cannot be empty.');
        hasErrors = true;
      }
    });
    return !hasErrors;
  }

export default router;