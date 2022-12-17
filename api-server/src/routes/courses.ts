import express from "express";
import { Course } from "../models/course/course";
import { GenericDAO } from "../models/generic.dao";
import { authService } from '../services/auth.service.js';
import { format } from 'date-fns';

const router = express.Router();

router.post('/', authService.authenticationMiddleware, async (req, res) => {
    const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
    const errors: string[] = [];

    const sendErrorMessage = (message: string) => {
        res.status(400).json({ message });
    };

    if (!hasRequiredFields(req.body, ['name', 'description', 'dayOfWeek', 'startDate', 'endDate', 'startTime', 'endTime'], errors)) {
        return sendErrorMessage(errors.join('\n'));
    }

    const createdCourse = await courseDAO.create({
        name: req.body.name,
        description: req.body.description,
        dayOfWeek: req.body.dayOfWeek,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        startTime: format(new Date(req.body.startTime), 'HH:mm'),
        endTime: format(new Date(req.body.endTime), 'HH:mm')
    })
    res.status(201).json(createdCourse);
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
        const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;

        const courses = await courseDAO.findAll();
        res.status(201).json({ results: courses})
})

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
    const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
    const course = await courseDAO.findOne({ id: req.params.id });

    res.status(200).json({ course })
})

function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
    let hasErrors = false;
    requiredFields.forEach(fieldName => {
      if (!object[fieldName]) {
        errors.push(fieldName + ' darf nicht leer sein.');
        hasErrors = true;
      }
    });
    return !hasErrors;
  }

export default router;