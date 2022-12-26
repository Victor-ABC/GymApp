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
    // machineId: Nullable<string>; //0..1 Machine e.G. Liegestütze hat keine Maschiene, Bankdrücken schon evtl. später mehr als 1 maschine -> dann mit "verbunddabelle"
    name: string;
    timeToRest: number;
    weight: number;
    repetitions: number;
}
