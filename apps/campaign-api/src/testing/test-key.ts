import { generateKeyPairSync } from "node:crypto";

export const testPrivateKey = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs1", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
}).privateKey.trim();

export const testPrivateKeyOneLine = testPrivateKey.replace(/\n/g, "\n");
