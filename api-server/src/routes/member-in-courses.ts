import express from "express";
import { Course } from "../models/course/course";
import { MemberInCourse } from "../models/course/member-in-course";
import { GenericDAO } from "../models/generic.dao";
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.post('/', authService.authenticationMiddleware, async (req, res) => {
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    const errors: string[] = [];

    const sendErrorMessage = (message: string) => {
        res.status(400).json({ message });
    };

    const createdMemberInCourse = await memberInCourseDAO.create({
        memberId: res.locals.user.id,
        courseId: req.body.courseId
    })
    console.log(`booked course: ${req.body.courseId} or user: ${res.locals.user.id}`)
    res.status(201).json(createdMemberInCourse);
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    const filter: Partial<MemberInCourse> = { memberId: res.locals.user.id };

    const memberInCourses = await memberInCourseDAO.findAll(filter);

    res.json({ results: memberInCourses});
})

export default router;