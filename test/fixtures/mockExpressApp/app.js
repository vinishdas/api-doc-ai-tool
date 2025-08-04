// test/fixtures/mockExpressApp/app.js
const express = require('express');
const app = express();

/**
 * A simple root endpoint.
 */
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// A router for user-related endpoints
const userRouter = express.Router();

/**
 * Gets a list of all users.
 */
userRouter.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

/**
 * Creates a new user.
 */
userRouter.post('/users', (req, res) => {
  res.status(201).send('User created');
});

// Nest the router under an /api prefix
app.use('/api', userRouter);

// This line is essential
module.exports = app;
