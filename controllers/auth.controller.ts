import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import { User, UserModel } from '../models/User.model';
import { errorHandler } from '../helpers/dbErrorHandler';
import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { Post } from '../models/Post.model';

export interface AuthRequest extends express.Request {
  auth?: { _id: string };
  post?: Post;
}

export const signup = async (req: Request, res: Response) => {
  try {
    const user = new UserModel(req.body);

    const result = await user.save();

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const signin = (req: Request, res: Response) => {
  const { username, password } = req.body;
  UserModel.findOne({ username }, (err: Error, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that username does not exist. Please signup.',
      });
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: 'Username and password do not match',
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string);

    res.cookie('SESSIONID', token, { expires: new Date(Date.now() + 900000) });

    return res.json({ token, user: req.user });
  });
};

export const signout = (req: Request, res: Response) => {
  res.clearCookie('SESSIONID');
  res.json({ message: 'Signout success' });
};

export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET as string,
  userProperty: 'auth',
  algorithms: ['sha1', 'RS256', 'HS256'],
});

export const isAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const authUserId = req.auth && req.auth._id;

  const user = userId === authUserId;
  if (!user) return res.status(403).json({ error: 'Access denied' });

  return next();
};

export const isModel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.auth && req.auth._id;
  if (!userId) return res.status(403).json({ error: 'Access denied' });

  try {
    const currUser: User = await UserModel.findById(userId);

    if (currUser?.role === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    return res.status(403).json({ error: errorHandler(err) });
  }
  return next();
};
