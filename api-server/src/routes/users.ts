/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express from 'express';
import bcrypt from 'bcryptjs';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/users/user.js';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  const sendErrorMessage = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };

  if (!hasRequiredFields(req.body, ['email', 'name', 'password', 'passwordCheck'], errors)) {
    return sendErrorMessage(errors.join('\n'));
  }

  if (req.body.password !== req.body.passwordCheck) {
    return sendErrorMessage('Die beiden Passwörter stimmen nicht überein.');
  }

  const filter: Partial<User> = { email: req.body.email };
  if (await userDAO.findOne(filter)) {
    return sendErrorMessage('Es existiert bereits ein Konto mit der angegebenen E-Mail-Adresse.');
  }

  const createdUser = await userDAO.create({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    isTrainer: req.body.isTrainer
  });
  authService.createAndSetToken({ id: createdUser.id }, res);
  res.status(201).json(createdUser);
});

router.post('/sign-in', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { email: req.body.email };
  const errors: string[] = [];

  if (!hasRequiredFields(req.body, ['email', 'password'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
    return;
  }
  const user = await userDAO.findOne(filter);
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    authService.createAndSetToken({ id: user.id }, res);
    res.status(201).json(user);
  } else {
    authService.removeToken(res);
    res.status(401).json({ message: 'E-Mail oder Passwort ungültig!' });
  }
});

router.delete('/sign-out', (req, res) => {
  authService.removeToken(res);
  res.status(200).end();
});

router.delete('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  userDAO.delete(res.locals.user.id);

  authService.removeToken(res);
  res.status(200).end();
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const users = await userDAO.findAll();
  res.status(201).json(users)
})

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { id: req.params.id };
  const user = await userDAO.findOne(filter);
  res.status(201).json({ result: user})
})

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => { 
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  await userDAO.delete(req.params.id);
  res.status(200).end(); 
})

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  const sendErrorMessage = (message: string) => {
      res.status(400).json({ message });
  };

  if (!hasRequiredFields(req.body, ['id', 'name',  'email', 'password', 'isTrainer'], errors)) {
      return sendErrorMessage(errors.join('\n'));
  }

  const user = await userDAO.update({
      id: req.body.id,  
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      isTrainer: req.body.isTrainer,
      avatar: req.body.avatar ?? null
  })
  res.status(201).json(user);
});

function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + ' darf nicht leer sein.');
      hasErrors = true;
    }
  });
  return !hasErrors;
}

export default router;
