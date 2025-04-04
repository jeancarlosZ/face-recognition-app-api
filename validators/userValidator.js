const { validateUserIdParam, validateName, validateEmail, validatePassword, handleValidationErrors } = require("../utils/validationUtils");

const validateRegistration = [
  validateName(),
  validateEmail(),
  validatePassword(),
  handleValidationErrors
];

const validateLogin = [
  validateEmail(),
  validatePassword(),
  handleValidationErrors
];

const validateUserProfile = [
  validateUserIdParam(),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateUserProfile
};
