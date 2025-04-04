const { body, param, validationResult } = require("express-validator");
const xss = require("xss");

const sanitizeInput = (value) => xss(value);

const validateImageUrlEntry = () => {
  return body("imageUrlEntry")
    .isURL().withMessage("Please provide a valid URL")
    .customSanitizer(sanitizeInput);
};

const validateUserIdBody = () => {
  return body("id")
    .trim()
    .notEmpty().withMessage("User ID is required")
    .escape()
    .customSanitizer(sanitizeInput);
};

const validateUserIdParam = () => {
  return param("id")
    .trim()
    .notEmpty().withMessage("User ID is required")
    .escape()
    .customSanitizer(sanitizeInput);
};

const validateName = () => {
  return body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .escape()
    .customSanitizer(sanitizeInput);
};

const validateEmail = () => {
  return body("email")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail()
    .escape()
    .customSanitizer(sanitizeInput);
};

const validatePassword = () => {
  return body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/).withMessage("Password must contain at least one special character from !@#$%^&*");
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  next();
};

module.exports = {
  sanitizeInput,
  validateImageUrlEntry,
  validateUserIdBody,
  validateUserIdParam,
  validateName,
  validateEmail,
  validatePassword,
  handleValidationErrors
};
