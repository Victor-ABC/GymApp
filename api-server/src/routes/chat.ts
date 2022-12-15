import express from 'express';
import { wsServer } from '../ws-server.js';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { Message } from '../models/users/message.js';

const router = express.Router();


router.post('/', authService.authenticationMiddleware, async (req, res) => {
    console.log("new post to create new Message");
    const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
    const newMessage = await messageDAO.create({ content: req.body.content, from: res.locals.user.id, to: req.body.to });
    wsServer.sendMessage(res.locals.user.id, { newMessage: newMessage });
    console.log("sended message via WS-Connection" + newMessage.content + " from: " + newMessage.from);
    res.redirect('/');
  });

export default router;