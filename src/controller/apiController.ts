import { NextFunction, Request, Response } from 'express';
import responseMessage from '../constant/responseMessage';
import { EUserRole } from '../constant/userConstant';
import databaseService from '../service/databaseService';
import { validateJoiSchema, validateRegisterBody } from '../service/validationService';
import { IRegisterRequestBody, IUser } from '../types/userTypes';
import httpError from '../util/httpError';
import httpResponse from '../util/httpResponse';
import quicker from '../util/quicker';

interface IRegisterRequest extends Request {
  body: IRegisterRequestBody;
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
      httpResponse(req, res, 201, responseMessage.SUCCESS, { _id: newUser._id });
    } catch (error) {
      httpError(next, error as Error, req, 500);
    }
  }
};
