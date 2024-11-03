import { EUserRole } from '../constant/userConstant';

export interface IRegisterRequestBody {
  name: string;
  emailAddress: string;
  phoneNumber: string;
  password: string;
  consent: boolean;
}

export interface ILoginRequestBody {
  emailAddress: string;
  password: string;
}

export interface IUser {
  name: string;
  emailAddress: string;
  phoneNumber: {
    isoCode: string;
    countryCode: string;
    internationalNumber: string;
  };
  timezone: string;
  password: string;
  role: EUserRole;
  accountConfirmation: {
    status: boolean;
    token: string;
    code: string;
    timestamp: Date | null;
  };
  passwordReset: {
    token: string | null;
    expiry: number | null;
    lastResetAt: Date | null;
  };
  lastLoginAt: Date | null;
  consent: boolean;
}

export interface IRefreshToken {
  token: string;
}
