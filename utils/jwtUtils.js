const crypto = require("crypto");
const { SignJWT, jwtVerify, EncryptJWT, jwtDecrypt } = require("jose");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_BUFFER = Buffer.from(JWT_SECRET_KEY, "base64");
const JWT_ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY;
const JWT_ENCRYPTION_KEY_BUFFER = Buffer.from(JWT_ENCRYPTION_KEY, "base64");
const JWS_ALGORITHM = "HS256";
const JWE_ALGORITHM = "A256GCMKW";
const JWE_ENCRYPTION = "A256GCM";

const generateSecretEncryptionKeys = () => {
  const jwtSecretKey = crypto.randomBytes(32).toString("base64");
  const jwtEncryptionKey = crypto.randomBytes(32).toString("base64");
  const cookieSecretKey = crypto.randomBytes(32).toString("hex");
  const sessionSecretKey = crypto.randomBytes(32).toString("base64");

  console.log("Base64 JWT Secret Key:", jwtSecretKey);
  console.log("Base64 JWT Encryption Key:", jwtEncryptionKey);
  console.log("Hex Cookie Secret Key:", cookieSecretKey);
  console.log("Base64 Session Secret Key:", sessionSecretKey);
}

const generateJWT = async (payload) => {
  const signedJWT = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWS_ALGORITHM })
    .setExpirationTime("1h")
    .sign(JWT_SECRET_KEY_BUFFER);

  return signedJWT;
}

const verifyJWT = async (signedJWT) => {
  const { payload } = await jwtVerify(signedJWT, JWT_SECRET_KEY_BUFFER);

  return payload;
}

const encryptJWT = async (signedJWT) => {
  const encryptedJWT = await new EncryptJWT(signedJWT)
    .setProtectedHeader({ alg: JWE_ALGORITHM, enc: JWE_ENCRYPTION })
    .setExpirationTime("1h")
    .encrypt(JWT_ENCRYPTION_KEY_BUFFER);

  return encryptedJWT;
}

const decryptJWT = async (encryptedJWT) => {
  const { payload } = await jwtDecrypt(encryptedJWT, JWT_ENCRYPTION_KEY_BUFFER);

  return payload;
}

module.exports = {
  generateSecretEncryptionKeys,
  generateJWT,
  verifyJWT,
  encryptJWT,
  decryptJWT,
};