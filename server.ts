import express from 'express';
import { Application } from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { authRoutes } from './routes/auth.route';
import { postRoutes } from './routes/posts.route';

import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import { userRoutes } from './routes/users.route';

const app: Application = express();

// db connection
mongoose.connect(`${process.env.MONGO_URI}`);

// middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan('dev'));

// routes middleware
app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', userRoutes);

app.listen(8000, () => {
  console.log('Server is now running on port 8000 ...');
});
