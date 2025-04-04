const { loadJwtLibrary, jwt, decryptJWT, verifyJWT } = require("../utils/jwtUtils");
const { sanitizeInput } = require("../utils/validationUtils");

module.exports = async (req, res, next) => {
  const encryptedToken = req.cookies["auth-token"];

  if (!encryptedToken) {
    return res.status(401).json({ message: "Token required" });
  }

  try {
    const { token } = await decryptJWT(encryptedToken.trim());
    const { userId } = await verifyJWT(token);

    sanitizeInput(userId);
    req.user = { id: userId };
    next();
  } catch (err) {
    await loadJwtLibrary();
    const { errors } = jwt;

    if (err instanceof errors.JWTInvalid) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else if (err instanceof errors.JWTExpired) {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    } else if (err instanceof errors.JWTClaimValidationFailed) {
      return res.status(401).json({ message: "Unauthorized: Token validation failed" });
    } else if (err instanceof errors.JWEInvalid) {
      return res.status(400).json({ message: "Bad Request: Invalid JWE token" });
    } else if (err instanceof errors.JWEDecryptionFailed) {
      return res.status(400).json({ message: "Bad Request: Decryption failed" });
    } else if (err instanceof errors.JOSEAlgNotAllowed) {
      return res.status(400).json({ message: "Bad Request: Encryption or algorithm invalid" });
    } else if (err instanceof errors.JOSEError) {
      return res.status(500).json({ message: "Internal Server Error: JOSE processing failed" });
    } else {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
