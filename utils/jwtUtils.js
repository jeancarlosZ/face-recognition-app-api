const crypto = require("crypto");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_BUFFER = Buffer.from(JWT_SECRET_KEY, "base64");
const JWT_ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY;
const JWT_ENCRYPTION_KEY_BUFFER = Buffer.from(JWT_ENCRYPTION_KEY, "base64");
const JWS_ALGORITHM = "HS256";
const JWE_ALGORITHM = "A256GCMKW";
const JWE_ENCRYPTION = "A256GCM";
let jwt;

const loadJwtLibrary = async () => {
  if (!jwt) {
    try {
      jwt = await import("jose");
    } catch (err) {
      console.log(`Error loading the JWT library: ${err}`);
    }
  }
}

const generateSecretEncryptionKeys = () => {
  const jwtSecretKey = crypto.randomBytes(32).toString("base64");
  const jwtEncryptionKey = crypto.randomBytes(32).toString("base64");

  console.log("Base64 JWT Secret Key:", jwtSecretKey);
  console.log("Base64 JWT Encryption Key:", jwtEncryptionKey);
}

const generateJWT = async (payload) => {
  await loadJwtLibrary();
  const { SignJWT } = jwt;
  const signedJWT = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWS_ALGORITHM })
    .setExpirationTime("1h")
    .sign(JWT_SECRET_KEY_BUFFER);

  return signedJWT;
}

const verifyJWT = async (signedJWT) => {
  await loadJwtLibrary();
  const { jwtVerify } = jwt;
  const { payload } = await jwtVerify(signedJWT, JWT_SECRET_KEY_BUFFER);

  return payload;
}

const encryptJWT = async (signedJWT) => {
  await loadJwtLibrary();
  const { EncryptJWT } = jwt;
  const encryptedJWT = await new EncryptJWT(signedJWT)
    .setProtectedHeader({ alg: JWE_ALGORITHM, enc: JWE_ENCRYPTION })
    .setExpirationTime("1h")
    .encrypt(JWT_ENCRYPTION_KEY_BUFFER);

  return encryptedJWT;
}

const decryptJWT = async (encryptedJWT) => {
  await loadJwtLibrary();
  const { jwtDecrypt } = jwt;
  const { payload } = await jwtDecrypt(encryptedJWT, JWT_ENCRYPTION_KEY_BUFFER);

  return payload;
}

module.exports = {
  loadJwtLibrary,
  jwt,
  generateSecretEncryptionKeys,
  generateJWT,
  verifyJWT,
  encryptJWT,
  decryptJWT,
};
