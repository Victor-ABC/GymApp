/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import mongodb from 'mongodb';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { Express } from 'express';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { PsqlGenericDAO } from './models/psql-generic.dao.js';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao.js';
import { User } from './models/users/user.js';
import { Course } from './models/course/course.js';
import config from '../config.json' assert { type: 'json' };
import { MemberInCourse } from './models/course/member-in-course.js';
import fetch from "node-fetch";

import fs from 'node:fs'; //ggf. löschen, falls unbenutzt
import { Workout } from './models/workout/workout.js';
import { Exercise } from './models/workout/exercise.js';
import { Machine } from './models/workout/machine.js';
import { Message } from './models/users/message.js';
import { Chat } from './models/users/chat.js';
import { Z_FIXED } from 'node:zlib';
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
/**
 * Hier wird die Datenbank ausgewählt.
 * Aktuell wird InMemory genommen.
 *
 * In der App wird GenericDAO verwendet, sodass hier die Impl. ausgewechselt (=Data Access Object-pattern)
 * werden können, ohne dass die App angepasst werden muss.
 * !!! Es gibt so etwas wie automatische-referenzauflösung mit nachladen
 * der "verbundenen" entitäten NICHT. möchte man also den trainingsplan mit der ID = UUID(1234), so muss man:
 *
 * TrainingPlan tp = app.loacals.trainingPlanDAO.findPlanUsingId(ID);
 * List<Uebungen> uebungen = app.locals.exerciseDAO.findAllUsingId(tp.id);
 * List<Geräte> geräte = [];
 * for(var uebung in uebungen) {
 *  if(uebung.gerätID != null) {
 *    geräte.add(app.locals.geräteDao.findByID(uebung.id))
 *  }
 * }
 * nun könnte man ein ResultDTO an den Client schicken, wo man alles reinpackt
 * ODER man schickt alles einzeln
 * @param app
 * @returns
 */
const getDemoUser = async () => {
  const fig = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

  return {
    name: 'demo',
    email: 'demo@demo.de',
    password: await bcrypt.hash('demo', 10),
    isTrainer: false,
    avatar: fig
  };
};

const getTimUser = async () => {
  const fig = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

  return {
    name: 'simon',
    email: 'simon@weis.de',
    password: await bcrypt.hash('demo', 10),
    isTrainer: false,
    avatar: fig
  };
};

const getSimonUser = async () => {
  const fig = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

  return {
    name: 'tim',
    email: 'tim@kress.de',
    password: await bcrypt.hash('demo', 10),
    isTrainer: false,
    avatar: fig
  };
};

async function startInMemoryDB(app: Express) {
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  (app.locals.userDAO as InMemoryGenericDAO<User>).create(await getDemoUser());
  (app.locals.userDAO as InMemoryGenericDAO<User>).create(await getTimUser());
  (app.locals.userDAO as InMemoryGenericDAO<User>).create(await getSimonUser());
  app.locals.courseDAO = new InMemoryGenericDAO<Course>();
  app.locals.memberInCourseDAO = new InMemoryGenericDAO<MemberInCourse>();
  app.locals.workoutDAO = new InMemoryGenericDAO<Workout>();
  app.locals.exerciseDAO = new InMemoryGenericDAO<Exercise>();
  app.locals.machineDAO = new InMemoryGenericDAO<Machine>();
  app.locals.messageDAO = new InMemoryGenericDAO<Message>();
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const client = await connectToMongoDB();
  const db = client.db('taskman');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  (app.locals.userDAO as MongoGenericDAO<User>).create(await getDemoUser());
  (app.locals.userDAO as MongoGenericDAO<User>).create(await getTimUser());
  (app.locals.userDAO as MongoGenericDAO<User>).create(await getSimonUser());
  app.locals.courseDAO = new MongoGenericDAO<Course>(db, 'course');
  app.locals.memberInCourseDAO = new MongoGenericDAO<MemberInCourse>(db, 'memberInCourse');
  app.locals.workoutDAO = new MongoGenericDAO<Workout>(db, 'workouts');
  app.locals.exerciseDAO = new MongoGenericDAO<Exercise>(db, 'exercise');
  app.locals.machineDAO = new MongoGenericDAO<Machine>(db, 'machines');
  app.locals.messageDAO = new MongoGenericDAO<Message>(db, 'messages');
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
  app.locals.userDAO = new PsqlGenericDAO<User>(client!, 'users');
  (app.locals.userDAO as PsqlGenericDAO<User>).create(await getDemoUser());
  (app.locals.userDAO as PsqlGenericDAO<User>).create(await getTimUser());
  (app.locals.userDAO as PsqlGenericDAO<User>).create(await getSimonUser());
  app.locals.courseDAO = new PsqlGenericDAO<Course>(client!, 'course');
  app.locals.memberInCourseDAO = new PsqlGenericDAO<MemberInCourse>(client!, 'memberInCourse');
  app.locals.workoutDAO = new PsqlGenericDAO<Workout>(client!, 'trainingPlan');
  app.locals.exerciseDAO = new PsqlGenericDAO<Exercise>(client!, 'exercise');
  app.locals.machineDAO = new PsqlGenericDAO<Machine>(client!, 'machine');
  app.locals.messageDAO = new PsqlGenericDAO<Message>(client!, 'message');
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

