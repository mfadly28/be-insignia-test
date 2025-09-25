// routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/auth');

// Public
router.post('/users', usersController.createUser);
router.post('/login', usersController.login);

// Protected routes (require JWT)
router.get('/users', authMiddleware, usersController.getAllUsers);
router.get('/users/:id', authMiddleware, usersController.getUserById);
router.put('/users/:id', authMiddleware, usersController.updateUser);
router.delete('/users/:id', authMiddleware, usersController.deleteUser);

module.exports = router;
