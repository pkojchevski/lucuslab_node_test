import { User, UserModel } from '../models/User.model';
import { errorHandler } from '../helpers/dbErrorHandler';
import { Request, Response } from 'express';
import { Post, PostModel } from '../models/Post.model';
import { Types } from 'mongoose';
import * as _ from 'lodash';
import { Roles } from '../models/Roles.model';

type UserID = {
  _id: Types.ObjectId;
  count: number;
};

export const listUsersWithMostPosts = async (req: Request, res: Response) => {
  const pageNo = Number(req.query.pageNo);
  const limit = Number(req.query.limit);
  const skip = limit * (pageNo - 1);

  if (!pageNo || !limit) {
    return res.status(400).json({ error: 'No query params available' });
  }

  if (pageNo < 0 || pageNo === 0) {
    return res
      .status(400)
      .json({ error: 'Invalid page number, should start with 1' });
  }

  try {
    const userIds: UserID[] = await PostModel.aggregate()
      .group({ _id: '$userId', count: { $sum: 1 } })
      .sort({ count: -1 })
      .skip(skip)
      .limit(limit)
      .project({ _id: 1, count: 2 });

    const users = [];

    if (userIds && userIds.length === 0)
      return res.json('Can not find more users');

    for (const doc of userIds) {
      const { _id, count } = doc;
      try {
        const user = await UserModel.findById(_id).select(
          'firstName lastName username profileImageUrl'
        );
        console.log('user:', { ...user });
        users.push({ user, count });
        res.json(users);
      } catch (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
    }
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const findUsersByQuery = async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const users: User[] = await UserModel.find({
      username: { $regex: `${name}`, $options: 'i' },
    }).select({ username: 1, _id: 0 });

    if (users && users.length === 0) return res.json('No users found');

    res.json(users.map(({ username }) => username));
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const showPostsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) return res.json('UserId not found');

  try {
    const posts: Post[] = await PostModel.find().where('userId').equals(userId);
    if (posts && posts.length === 0) return res.json('There are no any posts');

    return res.json(posts);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const findUsersByFiltering = async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const allUsers: User[] = await UserModel.find();

    const users: string[] = _.filter(
      allUsers,
      (user: User) => user.username.indexOf(name) > -1
    ).map((user: User) => user.username);

    if (users && users.length === 0) res.json('Users not found');

    res.json(users);
  } catch (err) {
    if (err) return res.status(400).json({ error: errorHandler(err) });
  }
};

export const subscribeToModel = async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log('userId:', userId);
  if (!userId)
    return res.status(404).json({ error: 'UserId is not available' });
  try {
    const result = await UserModel.findByIdAndUpdate(
      userId,
      { role: Roles.model },
      { new: true }
    );

    if (!result) return res.status(404).json({ error: 'User is not found' });

    return res.json(result);
  } catch (err) {
    return res.status(403).json({ error: errorHandler(err) });
  }
};

export const unsubscribeToModel = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId)
    return res.status(404).json({ error: 'UserId is not available' });
  try {
    const result = await UserModel.findByIdAndUpdate(
      userId,
      { role: Roles.user },
      { new: true }
    );

    if (!result) return res.status(404).json({ error: 'User is not found' });

    return res.json(result);
  } catch (err) {
    return res.status(403).json({ error: errorHandler(err) });
  }
};
