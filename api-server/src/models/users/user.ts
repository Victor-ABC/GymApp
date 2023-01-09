/* Autor: Victor Corbet */

import { Entity } from '../entity.js';

export interface User extends Entity {
  name: string;
  email: string;
  password: string;
  isTrainer: boolean;
  avatar?: string | null
}
