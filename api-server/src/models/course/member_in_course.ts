/* Autor: Victor Corbet */

import { Entity } from "../entity";

/**
 * This class resolves N:M Relation by using their PK
 */
export interface MemberInCourse extends Entity{
    memberId: string;
    courseId: string;
}
