import bcrypt from 'bcryptjs';
import { UserModel, IUser } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

const SALT_ROUNDS = 10;

export interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string };
}

function toPublicUser(user: IUser) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError(409, 'Email already registered');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({ name, email: email.toLowerCase(), password: hashed });

  const token = signToken({ userId: user._id.toString(), email: user.email });
  return { token, user: toPublicUser(user) };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.password) throw new AppError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const token = signToken({ userId: user._id.toString(), email: user.email });
  return { token, user: toPublicUser(user) };
}

export async function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  name: string
): Promise<AuthResult> {
  let user = await UserModel.findOne({ googleId });

  if (!user) {
    user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user) {
      user.googleId = googleId;
      await user.save();
    } else {
      user = await UserModel.create({ googleId, email: email.toLowerCase(), name });
    }
  }

  const token = signToken({ userId: user._id.toString(), email: user.email });
  return { token, user: toPublicUser(user) };
}

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  return toPublicUser(user);
}
