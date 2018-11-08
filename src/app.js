import express from 'express';

const app = express();
app.use(express.json());


const mongoURI = "mongodb://comsep:password1@ds143262.mlab.com:43262/comsepru-dev";

const mongoose = require('mongoose');
mongoose.connect(mongoURI);

import {Workflow} from './apps';


app.get('/api/v1/query', (req, res) => {
  Workflow.findActors({}, function (err, actors) {
    const result = actors.map(a => {
      a.send_event({ name: 'toggle', user: {role: "author"} });
      return {data: a, state: a.state}
    } )
    res.send(result);
  });
});

app.post('/api/v1/send_event/:id', (req, res) => {
  const result = Workflow.send_event_to(req.params.id, req.body, (err, result) => {
    res.send(result);
  });
});


app.get('/api/v1/gn', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'retrieved successfully',
    todos: {a: 'b'} //db
  })
});
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});

