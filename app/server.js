require('./config.js');

const _ = require("lodash");
const express = require('express');
const bodyParser = require('body-parser');
const ObjectId = require("mongoose").Types.ObjectId;
const pathfinderUI = require('pathfinder-ui')

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();

/////////////////////////////////
/////////MIDDLEWARE//////////////
////////////////////////////////

// make express deal with posts in the form of json (alternative to urlencoded)
app.use(bodyParser.json());

// pathfinder for showing routes prettily
app.use('/routes', function(req, res, next){
	pathfinderUI(app)
	next()
}, pathfinderUI.router)

////////////////////////////////
////////////ROUTES//////////////
////////////////////////////////

// CREATE
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.status(201).send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

//INDEX
app.get('/todos', (req, res) =>{
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

//SHOW
app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectId.isValid(id)){
    return res.status(404).send();
  }
  Todo.findById(id).then((todo) => {
    if (!todo){
      res.status(404).send();
    } else {
      res.status(200).send({todo});
    }
  }).catch((e) =>{
    res.status(400).send();
  });
});


//UPDATE


app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});


//DELETE

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectId.isValid(id)) {
    console.log("...............")
    return res.status(404).send();
  }
  Todo.findByIdAndRemove(id).then((todo) =>{
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch(() => {
    res.send(400).send();
  })
});

// POST /users "signup"

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});


// ------------------------------
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};