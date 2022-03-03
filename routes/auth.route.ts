import express from 'express';

export const authRoutes = express.Router();

import { signup, signin, signout } from '../controllers/auth.controller';
import {
  signinValidationRules,
  signupValidationRules,
  validate,
} from '../validator';

authRoutes.post('/signup', signupValidationRules(), validate, signup);
authRoutes.post('/signin', signinValidationRules(), validate, signin);
authRoutes.get('/signout', signout);
