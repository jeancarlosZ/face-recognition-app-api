const crypto = require("crypto");
const { SignJWT, jwtVerify, EncryptJWT, jwtDecrypt } = require("jose");

const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_KEY_BUFFER = Buffer.from(SECRET_KEY, "base64");
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, "base64");
const JWS_ALGORITHM = "HS256";
const JWE_ALGORITHM = "A256GCMKW";
const JWE_ENCRYPTION = "A256GCM";

const generateSecretEncryptionKeys = () => {
  const secretKey = crypto.randomBytes(32).toString("base64");
  const encryptionKey = crypto.randomBytes(32).toString("base64");

  console.log("Base64 Secret Key:", secretKey);
  console.log("Base64 Encryption Key:", encryptionKey);
}

const generateJWT = async (payload) => {
  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: JWS_ALGORITHM })
      .setExpirationTime("1h")
      .sign(SECRET_KEY_BUFFER);

    return jwt;
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error("Failed to generate JWT");
  }
}

const verifyJWT = async (jwt) => {
  try {
    const { payload } = await jwtVerify(jwt, SECRET_KEY_BUFFER);

    return payload;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    throw new Error("Invalid or expired JWT");
  }
}

const encryptJWT = async (signedJWT) => {
  try {
    const encryptedJWT = await new EncryptJWT(signedJWT)
      .setProtectedHeader({ alg: JWE_ALGORITHM, enc: JWE_ENCRYPTION })
      .setExpirationTime("1h")
      .encrypt(ENCRYPTION_KEY_BUFFER);

    return encryptedJWT;
  } catch (error) {
    console.error("Error encrypting JWT:", error);
    throw new Error("Failed to encrypt JWT");
  }
}

const decryptJWT = async (encryptedJWT) => {
  try {
    const { payload } = await jwtDecrypt(encryptedJWT, ENCRYPTION_KEY_BUFFER);

    return payload;
  } catch (error) {
    console.error("Error decrypting JWT:", error);
    throw new Error("Failed to decrypt JWT");
  }
}

module.exports = {
  generateSecretEncryptionKeys,
  generateJWT,
  verifyJWT,
  encryptJWT,
  decryptJWT,
};