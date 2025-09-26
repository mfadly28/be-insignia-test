const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

// Validation schemas
const createUserSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional()
});

exports.createUser = async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) return res.status(400).json({response_code : false, response_desc :'FAILED : ' + error.details[0].message });

    const { name, email, password } = value;
    // check existing email
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({response_code : false, response_desc :'FAILED : Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    return res.status(201).json({response_code : true, response_desc : 'SUCCESS', data : [{id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }]});
  } catch (err) {
    console.error(err);
    return res.status(500).json({response_code : false, response_desc :'FAILED : Database error', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'createdAt'] });
    return res.json({response_code : true, response_desc : 'SUCCESS', data : users});
  } catch (err) {
    console.error(err);
    return res.status(500).json({response_code : false, response_desc :'FAILED : Database error', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await User.findByPk(id, { attributes: ['id', 'name', 'email', 'createdAt'] });
    if (!user) return res.status(404).json({response_code : false, response_desc :'FAILED : User not found' });
    return res.json({response_code : true, response_desc : 'SUCCESS', data : user});
  } catch (err) {
    console.error(err);
    return res.status(500).json({response_code : false, response_desc :'FAILED : Database error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) return res.status(400).json({response_code : false, response_desc :'FAILED : ' + error.details[0].message });

    const id = parseInt(req.params.id, 10);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({response_code : false, response_desc :'FAILED : User not found' });

    if (value.email && value.email !== user.email) {
      const exists = await User.findOne({ where: { email: value.email } });
      if (exists) return res.status(409).json({response_code : false, response_desc :'FAILED : Email already in use' });
    }

    if (value.password) {
      value.password = await bcrypt.hash(value.password, 10);
    }

    await user.update(value);
    const updated = await User.findByPk(id, { attributes: ['id', 'name', 'email', 'createdAt'] });
    return res.json({response_code : true, response_desc : 'SUCCESS', data : updated});
  } catch (err) {
    console.error(err);
    return res.status(500).json({response_code : false, response_desc :'FAILED : Database error', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({response_code : false, response_desc :'FAILED : User not found' });
    await user.destroy();
    return res.status(204).json({response_code : true, response_desc :'SUCCESS : User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({response_code : false, response_desc :'FAILED : Database error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({response_code : false, response_desc :'FAILED : ' + error.details[0].message });

    const { email, password } = value;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({response_code : false, response_desc :'FAILED : Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({response_code : false, response_desc :'FAILED : Invalid credentials' });

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    return res.json({response_code : true, response_desc : 'SUCCESS', data : { accessToken: token, tokenType: "Bearer", expiresIn: jwtExpiresIn }});
  } catch (err) {
    console.error(err);
    return res.status(500).json({response_code : false, response_desc :'FAILED : Database error', error: err.message });
  }
};
