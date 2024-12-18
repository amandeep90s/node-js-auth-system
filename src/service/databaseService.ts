import mongoose from 'mongoose';
import config from '../config/config';
import RefreshToken from '../model/refreshTokenModel';
import User from '../model/userModel';
import { IRefreshToken, IUser } from '../types/userTypes';
import logger from '../util/logger';

export default {
  config: async () => {
    try {
      if (!config.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
      }
      await mongoose.connect(config.DATABASE_URL);
      return mongoose.connection;
    } catch (error) {
      logger.error('DATABASE_ERROR', { meta: { error } });
      throw new Error('Error connecting to database');
    }
  },
  findUserByEmailAddress: async (emailAddress: string, select: string = '') => {
    return await User.findOne({ emailAddress }).select(select);
  },
  registerUser: (payload: IUser) => User.create(payload),
  findUserByConfirmationTokenAndCode: (token: string, code: string) =>
    User.findOne({
      'accountConfirmation.token': token,
      'accountConfirmation.code': code
    }),
  createRefreshToken: (payload: IRefreshToken) => RefreshToken.create(payload)
};
