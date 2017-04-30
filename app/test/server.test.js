const expect = require('expect');
const request = require('supertest');
const ObjectId = require("mongoose").Types.ObjectId;

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todoSeeds = [
  { text: "test1", _id: new ObjectId(), completed: true, completedAt: 23498},
  { text: "test2", _id: new ObjectId()},
  { text: "test3", _id: new ObjectId()},
  { text: "test4", _id: new ObjectId()}
]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todoSeeds);
  }).then(() => done())
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test';
    request(app)
      .post('/todos')
      .send({text})
      .expect(201)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err){
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(todoSeeds.length + 1);
          expect(todos[4].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create n invalid new todo', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err){
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(todoSeeds.length);
          
          done();
        }).catch((e) => done(e));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect('Content-Type', /json/)

      .expect((res) => {
        expect(res.body.todos.length).toBe(todoSeeds.length);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should retrieve one todo given a correct id", (done) => {
    request(app)
      .get(`/todos/${todoSeeds[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todoSeeds[0].text);
      })
      .end(done);
  });
  it("should 404 given an incorrect id", (done) => {
    request(app)
      .get(`/todos/${todoSeeds[0]._id.toHexString().replace('5', '6')}`)
      .expect(404)
      .end(done);
  });
  it("should 404 given an invalid id", (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
  
});

describe("DELETE /todos/:id", () => {
  it("should delete one todo given a correct id", (done) => {
    let id = `${todoSeeds[0]._id.toHexString()}`
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todoSeeds[0].text);
      })
      .end((err, res) => {
        if (err){
          return done(err);
        }
        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });
  it("should 404 given an incorrect id", (done) => {
    let fakeId = new ObjectId().toHexString();
    request(app)
      .delete(`/todos/${fakeId}`)
      .expect(404)
      .end(done);
  });

  it("should 404 given an invalid id", (done) => {
    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });
  
});

describe("PATCH /todos/:id", () => {
  it("should update a valid todo", (done) => {
    let validId  = todoSeeds[0]._id.toHexString();
    var text = "New Text";
    request(app)
      .patch(`/todos/${validId}`)
      .send({completed: true, text})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');

      })
      .end(done);
  });
  it('should clear completedAt when todo is not completed', (done) => {
    var id = todoSeeds[1]._id.toHexString();
    var text = 'This should be the new text!!';

    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });

  it("should 404 given an incorrect id", (done) => {
    let fakeId = new ObjectId().toHexString();
    request(app)
      .patch(`/todos/${fakeId}`)
      .expect(404)
      .end(done);
  });

  it("should 404 given an invalid id", (done) => {
    request(app)
      .patch(`/todos/123`)
      .expect(404)
      .end(done);
  });
});