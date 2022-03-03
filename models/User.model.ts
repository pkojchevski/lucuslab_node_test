import { Document, Schema, model } from 'mongoose';
import { v1 as uuidv1 } from 'uuid';
import crypto from 'crypto';
import { Roles } from './Roles.model';

export interface UserDocument {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  profileImageUrl?: string;
  role: Roles;
}

export interface User extends UserDocument, Document {
  _id: string;
  hashed_password: string;
  salt: string;
}

export const UserSchema = new Schema<User>({
  firstName: {
    type: String,
    required: true,
    text: true,
  },
  lastName: {
    type: String,
    required: true,
    text: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    text: true,
  },
  profileImageUrl: String,
  hashed_password: {
    type: String,
    required: true,
  },
  salt: String,
  role: {
    type: Number,
    default: 0,
  },
});

UserSchema.virtual('password')
  .get(function (this: User) {
    return this.password;
  })
  .set(function (this: User, password: string) {
    this.salt = uuidv1();
    this.hashed_password = encryptPassword(password, this.salt);
  });

UserSchema.methods.authenticate = async function (
  this: User,
  plainText: string
) {
  return encryptPassword(plainText, this.salt) === this.hashed_password;
};

export const UserModel = model<User>('User', UserSchema);

const encryptPassword = (password: string, salt: string) => {
  if (!password) return '';
  try {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
  } catch (err) {
    return '';
  }
};
