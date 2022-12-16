import express from 'express';
import { wsServer } from '../ws-server.js';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { Message } from '../models/users/message.js';
import { Chat } from '../models/users/chat.js';
import e from 'express';

const router = express.Router();

router.get('/chats', authService.authenticationMiddleware, async (req, res) => {
  const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
  const chats: Array<Chat> = ((await chatDAO.findAll()) as Array<Chat>);
  var data = [];
  for(var chat of chats as Array<Chat>) {
    data.push({
      id: chat.id,
      createdAt: chat.createdAt,
      members: chat.members
    });
  }
  res.json({"data" : data});
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
  const chat = await chatDAO.findOne({ id: req.params.id });
  res.json({"data" : {
    messages: chat?.messages,
    id: chat?.id
  }});
});

router.post('/new', authService.authenticationMiddleware, async (req, res) => {
  console.log("new post to create new Chat");
  const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
  console.log("current user" + res.locals.user);
  //const newMessage = await chatDAO.create({ members: [], messages: [] });
  //wsServer.sendMessage(res.locals.user.id, { newMessage: newMessage });
  //res.redirect('/');
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
    console.log("new post to create new Message");
    //const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
    const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
    const newMessage = await messageDAO.create({ content: req.body.content, from: res.locals.user.id, to: req.body.to });
    wsServer.sendMessage(res.locals.user.id, { newMessage: newMessage });
    console.log("sended message via WS-Connection" + newMessage.content + " from: " + newMessage.from);
    //res.redirect('/');
  });

export default router;