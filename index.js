require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

morgan.token('body', req => JSON.stringify(req.body));

app.use(express.json());
app.use(express.static('dist'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

/* Get all persons */
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  })
})

/* Get a person by id */
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

/* Delete a person */
app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (!result) {
        return response.status(404).end()
      }
      response.status(204).end()
    })
    .catch(error => next(error))
})

/* Create a new person */
app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error)) 
})

/* Update a person's number */
app.put('/api/persons/:id', (request, response, next) => {
  const name = request.body.name
  const number = request.body.number

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

/* Info page */
app.get('/info', (request, response) => {
  const date = new Date();

  Person.find({}).then(persons => {
    const message = `<p>Phonebook has info for ${persons.length} people</p> <p>${date}</p>`;
    response.send(message);
  })
  
})

/* Error handler middleware */
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)