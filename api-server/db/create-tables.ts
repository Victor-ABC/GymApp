/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import pg from 'pg';
import fs from 'node:fs';

import config from '../config.json' assert { type: 'json' };

const { Client } = pg;

const client = new Client({
  user: config.db.connect.user,
  host: config.db.connect.host,
  database: config.db.connect.database,
  password: config.db.connect.password,
  port: config.db.connect.port.psql
});

async function createScheme() {
  await client.connect();
  await client.query('DROP TABLE IF EXISTS users, tasks');
  await client.query(`CREATE TABLE users(
    id VARCHAR(40) PRIMARY KEY,
    "createdAt" bigint NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255))`);
  await client.query(`CREATE TABLE tasks(
    id VARCHAR(40) PRIMARY KEY,
    "createdAt" bigint NOT NULL,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(10) NOT NULL,
    description VARCHAR(400),
    "dueDate" VARCHAR(10),
    "userId" VARCHAR(40))`);
}

createScheme().then(() => {
  client.end();
  console.log('finished');
});
