/* Autor: Victor Corbet */

import { Entity } from '../entity.js';
import { DayOfWeek } from './dayOfWeek.js';

/**
 * Da wir nur bestimmte Informationen über das Datum benötigen:
 * e.G. Montag, 8:30 - 19:30
 * definieren wir hier eine eigene Klasse.
 * 
 * Kurse sollen wiederkehrende Termine Haben, deshalb kein Jahr & Monat
 * 
 * Da wir generisch sein wollen, werden keine Klassen als Typen für Felder verwendet, sondern
 * nur einfache Datentypen. Referenzen müssen "manuell" geladen werden.
 * Sowas wie JPA (ORM) hier nicht möglich, da wir MongoDB & PostGres im einsatz haben wollen
 */
export interface Date extends Entity{ 
    dayOfWeek: DayOfWeek;
    startTimeHours: number;
    startTimeMinutes: number;
    endTimeHours: number;
    endTimeMinutes: number;
}
