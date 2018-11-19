var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
  name : String,
  message : String
})
//LINK DE LA BASE DE DATOS DEL CHAT, FALTA CONFIGURAR ESTA MIERDA PARA VARIOS USUARIOS
//var dbUrl = 'mongodb://amkurian:amkurian1@ds257981.mlab.com:57981/simple-chat'
var dbUrl='mongodb://root:daniel123@ds121099.mlab.com:21099/tkcdchat'

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req,res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('---- SAVED ----');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('---- MENSAJE:', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('---- ERROR',error);
  }
  finally{
    console.log('---- MENSAJE POSTEADO ----')
  }

})

io.on('connection', () =>{
  console.log('---- A USER IS CONNECTED ----')
})

mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
  console.log('---- MONGODB CONNECTED ---->',err);
})

var server = http.listen(3000, () => {
  console.log('SERVER IS RUNNING ON PORT', server.address().port);
});
