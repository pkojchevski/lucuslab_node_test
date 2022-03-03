import express from 'express';
import { isAuth, requireSignin } from '../controllers/auth.controller';
import {
  findUsersByFiltering,
  findUsersByQuery,
  listUsersWithMostPosts,
  showPostsByUserId,
  subscribeToModel,
  unsubscribeToModel,
} from '../controllers/user.controller';

export const userRoutes = express.Router();

userRoutes.get('/users/list', listUsersWithMostPosts);
userRoutes.get('/user/posts/:userId', requireSignin, isAuth, showPostsByUserId);
userRoutes.get('/users/query/:name', findUsersByQuery);
userRoutes.get('/users/filter/:name', findUsersByFiltering);
userRoutes.put(
  '/user/subscribe/:userId',
  requireSignin,
  isAuth,
  subscribeToModel
);
userRoutes.put(
  '/user/unsubscribe/:userId',
  requireSignin,
  isAuth,
  unsubscribeToModel
);
