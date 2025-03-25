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
  const signedJWT = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWS_ALGORITHM })
    .setExpirationTime("1h")
    .sign(SECRET_KEY_BUFFER);

  return signedJWT;
}

const verifyJWT = async (signedJWT) => {
  const { payload } = await jwtVerify(signedJWT, SECRET_KEY_BUFFER);

  return payload;
}

const encryptJWT = async (signedJWT) => {
  const encryptedJWT = await new EncryptJWT(signedJWT)
    .setProtectedHeader({ alg: JWE_ALGORITHM, enc: JWE_ENCRYPTION })
    .setExpirationTime("1h")
    .encrypt(ENCRYPTION_KEY_BUFFER);

  return encryptedJWT;
}

const decryptJWT = async (encryptedJWT) => {
  const { payload } = await jwtDecrypt(encryptedJWT, ENCRYPTION_KEY_BUFFER);

  return payload;
}

module.exports = {
  generateSecretEncryptionKeys,
  generateJWT,
  verifyJWT,
  encryptJWT,
  decryptJWT,
};