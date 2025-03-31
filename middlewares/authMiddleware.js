const { errors } = require("jose");
const { decryptJWT, verifyJWT } = require("../utils/jwtUtils");

module.exports = async (req, res, next) => {
  const encryptedToken = req.cookies["auth-token"];

  if (!encryptedToken) {
    return res.status(403).json({ message: "Token required" });
  }

  try {
    const { token } = await decryptJWT(encryptedToken);
    await verifyJWT(token);
    next();
  } catch (err) {
    if (err instanceof errors.JWTInvalid) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    if (err instanceof errors.JWTExpired) {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    if (err instanceof errors.JWTClaimValidationFailed) {
      return res.status(401).json({ message: "Unauthorized: Token validation failed" });
    }
    if (err instanceof errors.JWEInvalid) {
      return res.status(400).json({ message: "Bad Request: Invalid JWE token" });
    }
    if (err instanceof errors.JWEDecryptionFailed) {
      return res.status(400).json({ message: "Bad Request: Decryption failed" });
    }
    if (err instanceof errors.JOSEAlgNotAllowed) {
      return res.status(400).json({ message: "Bad Request: Encryption or algorithm invalid" });
    }
    if (err instanceof errors.JOSEError) {
      return res.status(500).json({ message: "Internal Server Error: JOSE processing failed" });
    }
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};