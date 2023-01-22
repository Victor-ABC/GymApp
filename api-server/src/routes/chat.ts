import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { Message } from '../models/users/message.js';
import { User } from '../models/users/user.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  var messagesFromMe = await messageDAO.findAll({ from: res.locals.user.id });
  var messagesToMe = await messageDAO.findAll({ to: res.locals.user.id });

  let partners = new Set<string>();
  for (var partner of messagesFromMe) {
    partners.add(partner.to);
  }
  for (var partner of messagesToMe) {
    partners.add(partner.from);
  }
  var users: Array<User> = [];
  for (var p of partners) {
    users.push((await userDAO.findOne({ id: p }))!);
  }
  
  res.json(users);
});

router.get('/all/users', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  var allUsers = await userDAO.findAll();
  var allMessages = await messageDAO.findAll();
  var newArray = allUsers.filter(e => e.id !== res.locals.user.id);
  for (var i = 0; i < newArray.length; i++) {
    for (var message of allMessages) {
      //already a message from user to me
      if (newArray[i]) {
        if (message.from === newArray[i].id && message.to === res.locals.user.id) {
          newArray.splice(i, 1);
        }

        if(!newArray[i]) {
          continue;
        }

        //already a message from me to user
        if (message.to === newArray[i].id && message.from === res.locals.user.id) {
          newArray.splice(i, 1);
        }
      }
    }
  }
  res.json(newArray);
});

export default router;
