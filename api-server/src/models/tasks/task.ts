/* Autor: Pascal Thesing */

import { Entity } from "../entity.js";
type Nullable<T> = T | null;
/**
 * Beim erstellen eines Kurses wird der 
 * wöchentliche Termin "date" und die 1. und letzte Kalenderwoche angegeben.
 * Zusätzlich brauchen wir das start-Jahr und end-Jahr
 */
export interface Task extends Entity {
    name: string,
    description: string,
    pictures: string[],
    taskType: string
}
