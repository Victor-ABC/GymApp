import express from "express";
import { MemberInCourse } from "../models/course/member-in-course";
import { Course } from "../models/course/course";
import { GenericDAO } from "../models/generic.dao";
import { authService } from '../services/auth.service.js';
import { format } from 'date-fns';

const router = express.Router();

interface BookedCourse {
    id?: string;
    name?: string;
    description?: string;
    dayOfWeek?: string;
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    bookingDate?: string;
    bookingId?: string;
}

router.post('/', authService.authenticationMiddleware, async (req, res) => {
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    const errors: string[] = [];

    const sendErrorMessage = (message: string) => {
        res.status(400).json({ message });
    };

    const filter: Partial<MemberInCourse> = { courseId: req.body.courseId, memberId: res.locals.user.id};
    if (await memberInCourseDAO.findOne(filter)) {
        return sendErrorMessage(`Der Kurs wurde bereits von Ihnen gebucht!`);
    }

    const createdMemberInCourse = await memberInCourseDAO.create({
        memberId: res.locals.user.id,
        courseId: req.body.courseId
    })

    console.log(`booked course: ${req.body.courseId} or user: ${res.locals.user.id}`)
    res.status(201).json(createdMemberInCourse);
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    const bookedCourseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
    const bookedCourses: BookedCourse[] = [];
    const filterMemberId: Partial<MemberInCourse> = { memberId: res.locals.user.id };
    const memberInCourses = await memberInCourseDAO.findAll(filterMemberId);
    if(memberInCourses) {
        for(const booking of memberInCourses) {
            const filterCourseId: Partial<Course> = { id: booking.courseId };
            const course = await bookedCourseDAO.findOne(filterCourseId)
            const bookedCourse: BookedCourse = {
                id: course?.id,
                name: course?.name,
                description: course?.description,
                dayOfWeek: course?.dayOfWeek,
                startDate: course?.startDate,
                endDate: course?.endDate,
                startTime: course?.startTime,
                endTime: course?.endTime,
                bookingDate: format(new Date(booking.createdAt), 'dd.MM.yyyy HH:mm'),
                bookingId: booking.id
            }
            bookedCourses.push(bookedCourse!);
        }
    }
    res.json({ results: bookedCourses});
})

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => { 
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    await memberInCourseDAO.delete(req.params.id);
    res.status(200).end(); 
});

export default router;