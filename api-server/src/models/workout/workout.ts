/* Autor: Victor Corbet */

import { Entity } from "../entity.js";

/**
 * Beim erstellen eines Kurses wird der 
 * wöchentliche Termin "date" und die 1. und letzte Kalenderwoche angegeben.
 * Zusätzlich brauchen wir das start-Jahr und end-Jahr
 */
export interface Workout extends Entity {
    createdBy: string; //user.id
    name: string;
}
