/* Autor: Pascal Thesing (FH Münster) */
import express from "express";
import { Workout } from "../models/workout/workout";
import { GenericDAO } from "../models/generic.dao";
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.post('/', authService.authenticationMiddleware, async (req, res) => {
    const workoutDAO: GenericDAO<Workout> = req.app.locals.workoutDAO;
    const errors: string[] = [];

    const sendErrorMessage = (message: string) => {
        res.status(400).json({ message });
    };

    if (!hasRequiredFields(req.body, ['name', 'createdBy'], errors)) {
        return sendErrorMessage(errors.join('\n'));
    }

    const workout = await workoutDAO.create({
        id: req.body.id,
        name: req.body.name,
        createdBy: res.locals.user.id
    })
    res.status(201).json(workout);
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const workoutDAO: GenericDAO<Workout> = req.app.locals.workoutDAO;
  const errors: string[] = [];

  const sendErrorMessage = (message: string) => {
      res.status(400).json({ message });
  };

  if (!hasRequiredFields(req.body, ['id', 'name', 'createdBy'], errors)) {
      return sendErrorMessage(errors.join('\n'));
  }

  const workout = await workoutDAO.update({
    id: req.body.id,  
    name: req.body.name,
  })

  res.status(201).json(workout);
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
        const workoutDAO: GenericDAO<Workout> = req.app.locals.workoutDAO;

        const workouts = await workoutDAO.findAll();
        res.status(201).json(workouts)
})

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
    const workoutDAO: GenericDAO<Workout> = req.app.locals.workoutDAO;
    const workout = await workoutDAO.findOne({ id: req.params.id });

    res.status(200).json({ data: workout })
})

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => { 
  const workoutDAO: GenericDAO<Workout> = req.app.locals.workoutDAO;
  await workoutDAO.delete(req.params.id);
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