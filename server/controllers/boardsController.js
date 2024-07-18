const db = require('../db');

const { board: Board } = require('../models/models');

exports.createBoard = async (req, res) => {
  try {
    const result = await Board.create(req.body);
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

exports.getAllboards = async (req, res) => {
  try {
    const result = await Board.findAll(req.query);

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

exports.getBoard = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Board.findById(id);
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

exports.updateBoard = async (req, res) => {
  try {
    const result = await Board.findByIdAndUpdate(req.params.id, req.body);
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
exports.deleteBoard = async (req, res) => {
  try {
    const result = await Board.findByIdAndDelete(req.params.id);
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
