import { NextFunction, Request, Response } from 'express';
import { QueryParams } from '../database/databaseManager';
import { Factory } from '../database/Factory';

const Person = Factory.personRepository();

const getAllPersons = async (req: Request, res: Response) => {
  try {
    const result = await Person.findAll(req.query as QueryParams);
    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'An unknown error occurred',
    });
  }
};

const updatePerson = async (req: Request, res: Response) => {
  try {
    const result = await Person.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'An unknown error occurred',
    });
  }
};

const createPerson = async (req: Request, res: Response) => {
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

const getPerson = async (req: Request, res: Response) => {
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

const deletePerson = async (req: Request, res: Response) => {
  try {
    const result = await Person.findByIdAndDelete(req.params.id);
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

export default {
  getAllPersons,
  updatePerson,
  createPerson,
  getPerson,
  deletePerson,
};
