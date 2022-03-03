import express from 'express';
import { requireSignin, isAuth, isModel } from '../controllers/auth.controller';
import {
  createPost,
  deletePost,
  updatePost,
  listPostsWithQuery,
  listPostsWithFilter,
} from '../controllers/posts.controllers';

export const postRoutes = express.Router();

postRoutes.post('/posts/:userId', requireSignin, isAuth, isModel, createPost);
postRoutes.get('/posts/query/list', listPostsWithQuery);
postRoutes.get('/posts/filter/list', listPostsWithFilter);
postRoutes.delete(
  '/posts/:postId/:userId',
  requireSignin,
  isAuth,
  isModel,
  deletePost
);
postRoutes.put(
  '/posts/:postId/:userId',
  requireSignin,
  isAuth,
  isModel,
  updatePost
);
