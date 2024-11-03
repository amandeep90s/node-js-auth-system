import bcrypt from 'bcrypt';
import { getTimezonesForCountry } from 'countries-and-timezones';
import { randomInt } from 'crypto';
import { parsePhoneNumber } from 'libphonenumber-js';
import os from 'os';
import { v4 } from 'uuid';
import config from '../config/config';
import logger from './logger';

const convertToMB = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2);
};

export default {
  getSystemHealth: () => {
    return {
      cpuUsage: os.loadavg(),
      totalMemory: `${convertToMB(os.totalmem())} MB`,
      freeMemory: `${convertToMB(os.freemem())} MB`
    };
  },
  getApplicationHealth: () => {
    return {
      environment: config.ENV,
      uptime: `${process.uptime().toFixed(2)} Seconds`,
      memoryUsage: {
        heapTotal: `${convertToMB(process.memoryUsage().heapTotal)} MB`,
        heapUsed: `${convertToMB(process.memoryUsage().heapUsed)} MB`
      }
    };
  },
  parsePhoneNumber: (phoneNumber: string) => {
    const defaultResponse = {
      countryCode: null,
      isoCode: null,
      internationalNumber: null
    };
    try {
      const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
      if (parsedPhoneNumber) {
        const { countryCallingCode, country } = parsedPhoneNumber;
        return {
          countryCode: countryCallingCode,
          isoCode: country ?? null,
          internationalNumber: parsedPhoneNumber.formatInternational()
        };
      }
      return defaultResponse;
    } catch (error) {
      logger.error(error);
      return defaultResponse;
    }
  },
  countryTimezone: (isoCode: string) => {
    return getTimezonesForCountry(isoCode);
  },
  hashPassword: (password: string) => bcrypt.hash(password, 10),
  comparePassword: (attemptedPassword: string, encryptedPassword: string) =>
    bcrypt.compare(attemptedPassword, encryptedPassword),
  generateRandomId: () => v4(),
  generateOtp: (length: number) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;

    return randomInt(min, max).toString();
  }
};
