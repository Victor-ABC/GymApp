/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Entity } from './entity.js';

export interface User extends Entity {
  name: string;
  email: string;
  password: string;
}
