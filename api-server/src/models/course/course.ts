/* Autor: Henrik Bruns */

import { Entity } from "../entity.js";

export interface Course extends Entity {
    name: string;
    description: string;
    dayOfWeek: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    trainerId: string;
}
