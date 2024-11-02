export default {
  SUCCESS: 'The operation has been successfully completed.',
  SOMETHING_WENT_WRONG: 'Something went wrong.',
  NOT_FOUND: (entity: string) => `${entity} not found`,
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  INVALID_PHONE_NUMBER: 'Invalid phone number',
  ALREADY_EXIST: (entity: string, identifier: string) => `${entity} is already exist with ${identifier}`,
  INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE: 'Invalid account confirmation token or code',
  ACCOUNT_ALREADY_CONFIRMED: 'Account already confirmed'
};
