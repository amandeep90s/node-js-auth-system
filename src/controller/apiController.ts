import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import responseMessage from '../constant/responseMessage';
import { EUserRole } from '../constant/userConstant';
import databaseService from '../service/databaseService';
import emailService from '../service/emailService';
import { validateJoiSchema, validateLoginBody, validateRegisterBody } from '../service/validationService';
import { ILoginRequestBody, IRegisterRequestBody, IUser } from '../types/userTypes';
import httpError from '../util/httpError';
import httpResponse from '../util/httpResponse';
import logger from '../util/logger';
import quicker from '../util/quicker';

dayjs.extend(utc);

interface IRegisterRequest extends Request {
  body: IRegisterRequestBody;
}

interface ILoginRequest extends Request {
  body: ILoginRequestBody;
}

interface IConfirmationRequest extends Request {
  params: {
    token: string;
  };
  query: {
    code: string;
  };
}

export default {
  self: (req: Request, res: Response, next: NextFunction) => {
    try {
      httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (error) {
      httpError(next, error as Error, req, 500);
    }
  },
  health: (req: Request, res: Response, next: NextFunction) => {
    try {
      const health = {
        application: quicker.getApplicationHealth(),
        system: quicker.getSystemHealth(),
        timestamp: Date.now()
      };
      httpResponse(req, res, 200, responseMessage.SUCCESS, health);
    } catch (error) {
      httpError(next, error as Error, req, 500);
    }
  },
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req as IRegisterRequest;
      // Body validation
      const { error, value } = validateJoiSchema<IRegisterRequestBody>(validateRegisterBody, body);
      if (error) {
        return httpError(next, error, req, 422);
      }

      // Phone number parsing & validation
      const { consent, emailAddress, name, password, phoneNumber } = value;
      const { countryCode, internationalNumber, isoCode } = quicker.parsePhoneNumber('+' + phoneNumber);
      if (!countryCode || !internationalNumber || !isoCode) {
        return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422);
      }

      // Timezone
      const timezone = quicker.countryTimezone(isoCode);
      if (!timezone || timezone.length === 0) {
        return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422);
      }

      // Check user existence using email address
      const isUserExist = await databaseService.findUserByEmailAddress(emailAddress);
      if (isUserExist) {
        return httpError(next, new Error(responseMessage.ALREADY_EXIST('user', emailAddress)), req, 422);
      }
      // Encrypting password
      const encryptedPassword = await quicker.hashPassword(password);

      // Account confirmation object data
      const token = quicker.generateRandomId();
      const code = quicker.generateOtp(6);

      // Creating user
      const payload: IUser = {
        name,
        emailAddress,
        phoneNumber: {
          isoCode,
          countryCode,
          internationalNumber
        },
        role: EUserRole.USER,
        password: encryptedPassword,
        accountConfirmation: {
          status: false,
          token,
          code,
          timestamp: null
        },
        passwordReset: {
          token: null,
          expiry: null,
          lastResetAt: null
        },
        lastLoginAt: null,
        timezone: timezone[0].name,
        consent
      };

      const newUser = await databaseService.registerUser(payload);
      // Sending confirmation email
      const confirmationUrl = `${config.FRONTEND_URL}/confirmation/${token}?code=${code}`;
      const to = [emailAddress];
      const subject = 'Confirm Your Account';
      const text = `Hey ${name}, Please confirm your account by clicking on the link given below \n\n${confirmationUrl}`;

      emailService.sendEmail(to, subject, text).catch((err) => {
        logger.error('EMAIL_SERVICE', {
          meta: err as Error
        });
      });

      httpResponse(req, res, 201, responseMessage.SUCCESS, { _id: newUser._id });
    } catch (error) {
      httpError(next, error as Error, req, 500);
    }
  },
  confirmation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, query } = req as IConfirmationRequest;
      const { token } = params;
      const { code } = query;

      // Fetch user by token & code
      const user = await databaseService.findUserByConfirmationTokenAndCode(token, code);
      if (!user) {
        return httpError(next, new Error(responseMessage.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 400);
      }

      // Check if account already confirmed
      const {
        accountConfirmation: { status }
      } = user;
      if (status) {
        return httpError(next, new Error(responseMessage.ACCOUNT_ALREADY_CONFIRMED), req, 400);
      }

      // Account confirm
      user.accountConfirmation.status = true;
      user.accountConfirmation.timestamp = dayjs().utc().toDate();
      await user.save();

      // Account confirmation email
      const to = [user.emailAddress];
      const subject = 'Account Confirmed';
      const text = 'Your account has been confirmed';

      emailService.sendEmail(to, subject, text).catch((err) => {
        logger.error('EMAIL_SERVICE', {
          meta: err as Error
        });
      });

      httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (error) {
      httpError(next, error as Error, req, 500);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate & parse body
      const { body } = req as ILoginRequest;

      const { error, value } = validateJoiSchema<ILoginRequestBody>(validateLoginBody, body);
      if (error) {
        return httpError(next, error, req, 422);
      }

      // Find user
      const { emailAddress } = value;
      const user = await databaseService.findUserByEmailAddress(emailAddress);
      if (!user) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 400);
      }
      // Validate password
      // Access & refresh token
      // Last login info
      // Refresh token store
      // Cookie send
      httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (error) {
      httpError(next, error as Error, req, 500);
    }
  }
};
