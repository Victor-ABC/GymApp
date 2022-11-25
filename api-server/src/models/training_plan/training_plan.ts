/* Autor: Victor Corbet */

import { Entity } from "../entity.js";

/**
 * Beim erstellen eines Kurses wird der 
 * wöchentliche Termin "date" und die 1. und letzte Kalenderwoche angegeben.
 * Zusätzlich brauchen wir das start-Jahr und end-Jahr
 */
export interface TrainingPlan extends Entity {
    erstelltVon: string; //user.id
    name: string;
}
