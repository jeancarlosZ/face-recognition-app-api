const { validateImageUrlEntry, validateUserIdBody, handleValidationErrors } = require("../utils/validationUtils");

const validateImageUrl = [
  validateImageUrlEntry(),
  validateUserIdBody(),
  handleValidationErrors
];

const validateImageCount = [
  validateUserIdBody(),
  handleValidationErrors
];

module.exports = {
  validateImageUrl,
  validateImageCount
};
