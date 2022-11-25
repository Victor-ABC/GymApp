/* Autor: Victor Corbet */

import { Entity } from "../entity.js";

/**
 * Beim erstellen eines Kurses wird der 
 * wöchentliche Termin "date" und die 1. und letzte Kalenderwoche angegeben.
 * Zusätzlich brauchen wir das start-Jahr und end-Jahr
 */
export interface Course extends Entity {
    name: string;
    dateId: string; //z.B. Montags, 18:30 bis 20:00 Uhr
    startKW: number; //40. KW 
    startJahr: number; //2020
    endKW: number; //"bis" 4. KW
    endJahr: number;//2021
}
