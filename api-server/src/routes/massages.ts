import express from 'express';
import { wsServer } from '../ws-server.js';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { Message } from '../models/users/message.js';
import { User } from '../models/users/user.js';

const router = express.Router();

router.get('/:other', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const idOfOtherUser = req.params.other;
  var messagesFromMe = await messageDAO.findAll({ from: res.locals.user.id, to: idOfOtherUser });
  var messagesToMe = await messageDAO.findAll({ from: idOfOtherUser, to: res.locals.user.id });
  var new_messageToMe = [];
  var id_of_read_messages = [];
  for (var m of messagesToMe) {
    if (m.recieved == false) {
      var new_m: Message = {
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        from: m.from,
        to: m.to,
        recieved: true
      };
      id_of_read_messages.push(new_m.id);
      new_messageToMe.push(new_m);
      await messageDAO.update(new_m);
    } else {
      new_messageToMe.push(m);
    }
  }
  wsServer.sendReadNotification(idOfOtherUser, { readNotifications: id_of_read_messages });
  var result = [...messagesFromMe, ...new_messageToMe];
  res.json(result);
});

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const idOfOtherUser = req.params.other;
  var messagesFromMe = await messageDAO.findAll({ from: res.locals.user.id });
  var messagesToMe = await messageDAO.findAll({ to: res.locals.user.id });

  var result = [...messagesFromMe, ...messagesToMe];
  res.json(result);
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  var newMessage = await messageDAO.create({
    id: req.body.id,
    content: req.body.content,
    from: res.locals.user.id,
    to: req.body.to,
    recieved: false
  });
  wsServer.sendChatMessage(res.locals.user.id, req.body.to, { newMessage: newMessage });
});

router.patch('/read', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  var message: Message | null = await messageDAO.findOne({id : req.body.id});
  if(message) {
    var new_m: Message = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      from: message.from,
      to: message.to,
      recieved: true
    };
    await messageDAO.update(new_m);
    wsServer.sendReadNotification(req.body.to, { readNotification: req.body.id });
  }
});

export default router;
