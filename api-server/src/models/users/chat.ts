
/* Autor: Victor Corbet */

import { Entity } from '../entity.js';
import { Message } from './message.js';
import { User } from './user.js';

export interface Chat extends Entity {
  members: Array<User>;
  messages: Array<Message>;
}
