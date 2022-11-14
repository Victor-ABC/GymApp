/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import mongodb from 'mongodb';
import pg from 'pg';
import { Express } from 'express';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { PsqlGenericDAO } from './models/psql-generic.dao.js';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao.js';
import { Task } from './models/task.js';
import { User } from './models/user.js';
import fs from 'node:fs';

import config from '../config.json' assert { type: 'json' };
const { MongoClient } = mongodb;
const { Client } = pg;

export default async function startDB(app: Express) {
  switch (config.db.use) {
    case 'mongodb':
      return await startMongoDB(app);
    case 'psql':
      return await startPsql(app);
    default:
      return await startInMemoryDB(app);
  }
}

async function startInMemoryDB(app: Express) {
  app.locals.taskDAO = new InMemoryGenericDAO<Task>();
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const client = await connectToMongoDB();
  const db = client.db('taskman');
  app.locals.taskDAO = new MongoGenericDAO<Task>(db, 'tasks');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  return async () => await client.close();
}

async function connectToMongoDB() {
  const url = `mongodb://${config.db.connect.host}:${config.db.connect.port.mongodb}`;
  const client = new MongoClient(url, {
    auth: { username: config.db.connect.user, password: config.db.connect.password },
    authSource: config.db.connect.database
  });
  try {
    await client.connect();
  } catch (err) {
    console.log('Could not connect to MongoDB: ', err);
    process.exit(1);
  }
  return client;
}

async function startPsql(app: Express) {
  const client = await connectToPsql();
  app.locals.taskDAO = new PsqlGenericDAO<Task>(client!, 'tasks');
  app.locals.userDAO = new PsqlGenericDAO<User>(client!, 'users');
  return async () => await client.end();
}

async function connectToPsql() {
  const client = new Client({
    user: config.db.connect.user,
    host: config.db.connect.host,
    database: config.db.connect.database,
    password: config.db.connect.password,
    port: config.db.connect.port.psql
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.log('Could not connect to PostgreSQL: ', err);
    process.exit(1);
  }
}
