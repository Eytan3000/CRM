const db = require('../db');
const { validateEmail } = require('../helpers');

const { person: Person } = require('../models/models');

exports.createPerson = async (req, res) => {
  try {
    const result = await Person.create(req.body);
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

exports.getAllPersons = async (req, res) => {
  try {
    const result = await Person.findAll(req.query);

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

exports.getPerson = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Person.findById(id);
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

exports.updatePerson = async (req, res) => {
  try {
    const result = await Person.findByIdAndUpdate(req.params.id, req.body);
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
exports.deletePerson = async (req, res) => {
  try {
    const result = await Person.findByIdAndDelete(req.params.id);
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
