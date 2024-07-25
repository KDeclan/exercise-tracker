const express = require('express')
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const userId = uuidv4();

  const newUser = {
    username: username,
    _id: userId,
  };

  users.push(newUser);

  res.status(201).json({ message: 'User created', user: newUser });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

const exercises = [];

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date   } = req.body;

  const newExcercise = {
    userId: _id,
    description: description,
    duration: duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  exercises.push(newExcercise);

  res.status(200).json({  message: 'Excercise created', excercise: newExcercise });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  let userExercises = exercises.filter(exercise => exercise.userId === _id);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(exercise => new Date(exercise.date) <= toDate);
  }
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  // Ensure the correct types for each property
  userExercises = userExercises.map(exercise => ({
    ...exercise,
    description: String(exercise.description),
    duration: Number(exercise.duration),
    date: new Date(exercise.date).toDateString()
  }));

  res.json(userExercises);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
