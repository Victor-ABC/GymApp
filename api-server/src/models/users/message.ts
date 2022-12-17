/* Autor: Victor Corbet */

import { Entity } from '../entity.js';

/*
    message
*/
export interface Message extends Entity {
  content: string;
  from: string;
  to: string;
  recieved: boolean;
}
