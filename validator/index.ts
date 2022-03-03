import { NextFunction, Request, Response } from 'express';
import { body, validationResult, ValidationError } from 'express-validator';

type Error = {
  [x: string]: string;
};

export const signupValidationRules = () => {
  return [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('profileImageUrl').notEmpty(),
    body('password').isLength({ min: 6 }),
    body('username').isLength({ min: 3 }),
  ];
};

export const signinValidationRules = () => {
  return [
    body('password').isLength({ min: 6 }),
    body('username').isLength({ min: 3 }),
  ];
};

export const postValidationRules = () => {
  return [
    body('mediaUrl').notEmpty(),
    body('description').notEmpty(),
    body('userId').notEmpty(),
  ];
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: Error[] = [];
  errors
    .array()
    .map((err: ValidationError) =>
      extractedErrors.push({ [err.param]: err.msg })
    );

  return res.status(422).json({
    errors: extractedErrors,
  });
};
