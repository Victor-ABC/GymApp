/* Autor: Victor Corbet */

import { Entity } from "../entity.js";
type Nullable<T> = T | null;
/**
 * Beim erstellen eines Kurses wird der 
 * wöchentliche Termin "date" und die 1. und letzte Kalenderwoche angegeben.
 * Zusätzlich brauchen wir das start-Jahr und end-Jahr
 */
export interface Exercise extends Entity {
    workoutId: string;
    taskId: string;
    timeToRest: number;
    weight: number;
    repetitions: number;
    sets: number
}
