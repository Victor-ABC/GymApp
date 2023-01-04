import express from "express";
import { MemberInCourse } from "../models/course/member-in-course";
import { Course } from "../models/course/course";
import { GenericDAO } from "../models/generic.dao";
import { authService } from '../services/auth.service.js';
import { format } from 'date-fns';
import { User } from "../models/users/user";

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

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    const bookedCourseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
    const bookedCourse: BookedCourse = {};

    const filterMiC: Partial<MemberInCourse> = { id: req.params.id };
    const memberInCourse = await memberInCourseDAO.findOne(filterMiC);
    if(memberInCourse) {
            const filterCourseId: Partial<Course> = { id: memberInCourse.courseId };
            const course = await bookedCourseDAO.findOne(filterCourseId)
            
            bookedCourse.id = course?.id;
            bookedCourse.name = course?.name,
            bookedCourse.description = course?.description,
            bookedCourse.dayOfWeek = course?.dayOfWeek,
            bookedCourse.startDate = course?.startDate,
            bookedCourse.endDate = course?.endDate,
            bookedCourse.startTime = course?.startTime,
            bookedCourse.endTime = course?.endTime,
            bookedCourse.bookingDate = format(new Date(memberInCourse.createdAt), 'dd.MM.yyyy HH:mm'),
            bookedCourse.bookingId = memberInCourse.id
    }
    res.json({ result: bookedCourse});
})

router.get('/member/:id', authService.authenticationMiddleware, async (req, res) => {
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;

    const filterMiC: Partial<MemberInCourse> = { courseId: req.params.id };
    const memberInCourses = await memberInCourseDAO.findAll(filterMiC);
    const users: User[] = [];

    for(const booking of memberInCourses) {
        const userFilter: Partial<User> = { id: booking.memberId };
        const user = await userDAO.findOne(userFilter);
        if(user) {
            users.push(user);
        }
    }
    res.json({ result: users});
})

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => { 
    const memberInCourseDAO: GenericDAO<MemberInCourse> = req.app.locals.memberInCourseDAO;
    await memberInCourseDAO.delete(req.params.id);
    res.status(200).end(); 
});

export default router;