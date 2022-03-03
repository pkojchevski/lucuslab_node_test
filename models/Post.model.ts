import { Schema, model, ObjectId } from 'mongoose';

export interface Post {
  userId: ObjectId;
  mediaUrl: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<Post>({
  userId: {
    type: Schema.Types.ObjectId,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

export const PostModel = model<Post>('Post', PostSchema);
