import mongoose from 'mongoose';
import { IRefreshToken } from '../types/userTypes';

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const RefreshToken = mongoose.model<IRefreshToken>('refresh-token', refreshTokenSchema);

export default RefreshToken;
