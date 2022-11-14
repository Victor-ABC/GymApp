/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Entity } from './entity.js';

export interface Task extends Entity {
  title: string;
  status: 'open' | 'done';
  dueDate: string;
  description: string;
  userId: string;
}
