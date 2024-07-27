import Joi from 'joi';

const userSchema = Joi.object({
  username: Joi.string().min(3).required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(3).required(),
  // passwordConfirm: Joi.string().valid(Joi.ref('password')).required().messages({
  //   'any.only': 'Passwords do not match',
  // }),
  role: Joi.string(),
});

const personSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string().max(30).trim(),
  email: Joi.string().max(50).trim().lowercase(),
  phone: Joi.string().max(50).trim(),
  website: Joi.string().max(1000).trim(),
  facebook: Joi.string().max(1000).trim(),
  linkedin: Joi.string().max(1000).trim(),
  link: Joi.string().max(1000).trim(),
  hebrew_name: Joi.string().max(50).trim(),
});

const boardSchema = Joi.object({
  id: Joi.string(),
  title: Joi.string().min(3).max(30).trim(),
});

export { userSchema, personSchema, boardSchema };
