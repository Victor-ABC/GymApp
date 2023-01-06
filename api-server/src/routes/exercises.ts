/* Autor: Pascal Thesing (FH Münster) */

import express from "express";
import { Exercise } from "../models/workout/exercise";
import { GenericDAO } from "../models/generic.dao";
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.post('/', authService.authenticationMiddleware, async (req, res) => {
    const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const errors: string[] = [];

    const sendErrorMessage = (message: string) => {
        res.status(400).json({ message });
    };

    if (!hasRequiredFields(req.body, ['name', 'workoutId', 'timeToRest', 'weight', 'repetitions'], errors)) {
        return sendErrorMessage(errors.join('\n'));
    }

    const exercies = await exerciseDAO.create({
        name: req.body.name,
        workoutId: req.body.workoutId,
        timeToRest: req.body.timeToRest,
        weight: req.body.weight,
        repetitions: req.body.repetitions,
        sets: req.body.sets
    })
    res.status(201).json(exercies);
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;
  const errors: string[] = [];

  const sendErrorMessage = (message: string) => {
      res.status(400).json({ message });
  };

  if (!hasRequiredFields(req.body, ['id', 'name', 'workoutId', 'timeToRest', 'weight', 'repetitions'], errors)) {
      return sendErrorMessage(errors.join('\n'));
  }

  const exercies = await exerciseDAO.update({
      id: req.body.id,
      name: req.body.name,
      workoutId: req.body.workoutId,
      timeToRest: req.body.timeToRest,
      weight: req.body.weight,
      repetitions: req.body.repetitions,
      sets: req.body.sets
  })
  res.status(201).json(exercies);
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
    const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;

        const exercies = await exerciseDAO.findAll();
        res.status(201).json({ results: exercies})
})

router.get('/workout/:id', authService.authenticationMiddleware, async (req, res) => {
  const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;

      const exercies = await exerciseDAO.findAll({ workoutId: req.params.id });
      res.status(201).json({ results: exercies})
})

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
    const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;
    const exercies = await exerciseDAO.findOne({ id: req.params.id });

    res.status(200).json({ data: exercies })
})

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => { 
    const exerciseDAO: GenericDAO<Exercise> = req.app.locals.exerciseDAO;
  await exerciseDAO.delete(req.params.id);
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