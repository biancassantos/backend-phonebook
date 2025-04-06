const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

morgan.token('body', req => JSON.stringify(req.body));

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

app.get('/api/persons', (request, response) => {
  response.json(persons);
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end;
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
})

app.post('/api/persons', (request, response) => {
  const body = request.body;

  const generateId = () => Math.floor(Math.random() * 100);
  const personAlreadyExists = persons.find(person => person.name === body.name);

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  if (personAlreadyExists) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons.concat(person);

  response.json(person);
})

app.get('/info', (request, response) => {
  const date = new Date();
  const message = `<p>Phonebook has info for ${persons.length} people</p> <p>${date}</p>`;
  response.send(message);
})