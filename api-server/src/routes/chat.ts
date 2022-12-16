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
  /*
  if((await messageDAO.findAll()).length == 0) {
    messageDAO.create({
      content: "hello World: tim an simon",
      from: (await userDAO.findOne({email : "tim@kress.de"}))!.id,
      to: (await userDAO.findOne({email : "simon@weis.de"}))!.id,
    })
    messageDAO.create({
      content: "hello World back: simon an tim",
      from: (await userDAO.findOne({email : "simon@weis.de"}))!.id,
      to: (await userDAO.findOne({email : "tim@kress.de"}))!.id,
    })
    messageDAO.create({
      content: "hello World: tim an demo",
      from: (await userDAO.findOne({email : "tim@kress.de"}))!.id,
      to: (await userDAO.findOne({email : "demo@demo.de"}))!.id,
    })
  }
  */
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

router.get('/:other', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const idOfOtherUser = req.params.other;
  console.log("other: " + idOfOtherUser + " me: " + res.locals.user.id);
  var messagesFromMe = await messageDAO.findAll({from : res.locals.user.id, to: idOfOtherUser});
  var messagesToMe = await messageDAO.findAll({from: idOfOtherUser, to : res.locals.user.id});
  var result = [...messagesFromMe, ...messagesToMe];
  console.log("result: " + result);
  res.json({"data" : result});
});

router.get('/all/users', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  var allUsers = await userDAO.findAll();
  var allMessages = await messageDAO.findAll();
  var newArray = allUsers.filter(e => e.id !== res.locals.user.id);
  for(var i = 0; i < newArray.length; i++) {
    for(var message of allMessages) {
      console.log("message.from " + message.from);
      console.log("message.to " + message.to);
      console.log("my id " +res.locals.user.id);
      console.log("user id " + newArray[i].id);
      //already a message from user to me
      if(message.from === newArray[i].id && message.to === res.locals.user.id) {
        console.log("XXXX Removed XXXX");
        newArray.splice(i, 1);
      }
      //already a message from me to user
      if(message.to === newArray[i].id && message.from === res.locals.user.id) {
        console.log("XXXX Removed XXXX");
        newArray.splice(i, 1);
      }
    }
  }
  res.json({"data" : newArray});
});

router.post('/new', authService.authenticationMiddleware, async (req, res) => {
    const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
    var  newMessage = await messageDAO.create({
      content : req.body.content,
      from : res.locals.user.id,
      to : req.body.to
    });
    wsServer.sendChatMessage(res.locals.user.id, req.body.to, { newMessage: newMessage });
  });

export default router;