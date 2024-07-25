const express = require('express');
const app = express();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];
const exercises = [];

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const userId = uuidv4();

  const newUser = {
    username: username,
    _id: userId,
  };

  users.push(newUser);

  res.status(201).json({ username: newUser.username, _id: newUser._id });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add an exercise for a specific user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params; // Extract user ID from URL parameters
  const { description, duration, date } = req.body;

  const newExercise = {
    userId: _id,
    description: String(description),
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  exercises.push(newExercise);

  res.status(200).json({
    _id,
    username: users.find(user => user._id === _id).username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
  });
});

// Get exercise logs for a specific user with optional filters
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params; // Extract user ID from URL parameters
  const { from, to, limit } = req.query; // Extract query parameters

  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

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

  res.json({
    _id: user._id,
    username: user.username,
    count: userExercises.length,
    log: userExercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
