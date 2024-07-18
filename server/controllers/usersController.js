const db = require('../db');
const { validateEmail } = require('../helpers');

const { user: User } = require('../models/models');

// middleware checks:
exports.checkBody = (req, res, next) => {
  const { username, email, password } = req.body;
  console.log('username: ', username); //removeEytan
  console.log('email: ', email); //removeEytan

  if (username !== undefined && typeof username !== 'string') {
    return res.status(404).json({
      status: 'error',
      message: 'username must be a string',
    });
  }
  if (
    email !== undefined &&
    (typeof email !== 'string' || !validateEmail(email))
  ) {
    return res.status(404).json({
      status: 'error',
      message: 'Invalid email',
    });
  }
  // TODO: password validation?

  next();
};

// crud:
exports.createUser = async (req, res) => {
  try {
    const result = await User.create(req.body);
    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err,
    });
  }
};

exports.getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await User.findById(id);
    console.log('result2: ', result); //removeEytan
    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const result = await User.findAll(req.query);

    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(req.params.id, req.body);
    console.log('result: ', result); //removeEytan
    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err,
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    console.log('result: ', result); //removeEytan
    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err,
    });
  }
};
