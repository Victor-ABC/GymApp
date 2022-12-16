import express from 'express';
import { wsServer } from '../ws-server.js';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { Message } from '../models/users/message.js';
import { User } from '../models/users/user.js';
import e from 'express';

const router = express.Router();


router.get('/chats', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  //Default Data -->
  if((await messageDAO.findAll()).length == 0) {
    messageDAO.create({
      content: "hello World",
      from: (await userDAO.findOne({email : "tim@kress.de"}))!.id,
      to: (await userDAO.findOne({email : "simon@weis.de"}))!.id,
    })
  }
  //<--

  var messagesFromMe = await messageDAO.findAll({from : res.locals.user.id});
  var messagesToMe = await messageDAO.findAll({to : res.locals.user.id});
  let partners = new Set<string>();
  for(var partner of messagesFromMe) {
    partners.add(partner.to);
  }
  for(var partner of messagesToMe) {
    partners.add(partner.from);
  }
  var users: Array<User> = [];
  for(var p of partners) {
    users.push( 
      (await userDAO.findOne({id : p}))!
    )
  }
  res.json({"data" : users});
});
/*
router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
  const chat = await chatDAO.findOne({ id: req.params.id });
  res.json({"data" : chat?.messages});
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
    const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
    messageDAO.create({
      content : req.body.content,
      from : res.locals.user.id,
      to : res.locals.to
    });
    const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
    const chat = await chatDAO.findOne({ id: req.body.id });
    var newMessage: Message = {
        content = req.body.content,

    };
    chat?.messages.push(req.)
    chatDAO.update({ id: req.body.id }, {})
    //const newMessage = await messageDAO.create({ content: req.body.content, from: res.locals.user.id, to: req.body.to });
    //wsServer.sendMessage(res.locals.user.id, { newMessage: newMessage });
    //console.log("sended message via WS-Connection" + newMessage.content + " from: " + newMessage.from);
    //res.redirect('/');
  });
*/
export default router;