import { errorHandler } from '../helpers/dbErrorHandler';
import { Request, Response } from 'express';
import { PostModel, Post } from '../models/Post.model';
import { AuthRequest } from './auth.controller';
import { User, UserModel } from '../models/User.model';
import { Roles } from '../models/Roles.model';

export const listPostsWithQuery = async (req: Request, res: Response) => {
  try {
    const userIds = await UserModel.find()
      .select('_id')
      .where('role')
      .equals(Roles.model);

    if (userIds && userIds.length === 0)
      return res.status(400).json({ error: 'No available models' });

    const posts: Post[] = await PostModel.find({
      userId: { $in: userIds },
    }).sort('-createdAt');

    if (posts && posts.length === 0)
      return res.status(400).json({ error: 'No posts from models' });

    res.json(posts);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const listPostsWithFilter = async (req: Request, res: Response) => {
  try {
    const usersAll: User[] = await UserModel.find();
    const postsAll: Post[] = await PostModel.find();

    const userIds = usersAll
      .filter((user: User) => user.role === Roles.model)
      .map((user: User) => user._id.toString());

    console.log('userIds:', userIds);
    console.log('postsAll:', postsAll);

    const posts = postsAll
      .filter((post: Post) => userIds.includes(post.userId.toString()))
      .sort(
        (p1: Post, p2: Post) => p2.createdAt.getTime() - p1.createdAt.getTime()
      );

    res.json(posts);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const userFromParam = req.params.userId;
  const { userId } = req.body;

  if (userId !== userFromParam)
    return res.status(400).json({ error: 'Access denied' });

  const post = new PostModel({ ...req.body, createdAt: Date.now() });

  try {
    const result = await post.save();
    res.json(result);
  } catch (err) {
    if (err) return res.status(400).json({ error: errorHandler(err) });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const result = await PostModel.findByIdAndRemove(postId);

    if (!result) return res.json({ error: 'Post does not exists' });

    return res.json(result);
  } catch (err) {
    if (err) return res.status(400).json({ error: errorHandler(err) });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  const post = { ...req.body, updatedAt: Date.now() };

  try {
    const result = await PostModel.findByIdAndUpdate(post._id, post);
    if (!result) return res.json({ error: 'Post does not exists' });

    return res.json(result);
  } catch (err) {
    if (err) return res.status(400).json({ error: errorHandler(err) });
  }
};

// it will find products based on the req product
// category, other products that have same category will be returned
//   exports.listRelated = (req, res) => {
//     const limit = req.query.limit ? parseInt(req.query.limit) : 6;

//     Product.find({ _id: { $ne: req.product }, category: req.product.category })
//       .limit(limit)
//       .populate('category', '_id name')
//       .exec((err, products) => {
//         if (err) return res.status(400).json({ error: 'Products not found' });
//         res.json(products);
//       });
//   };
