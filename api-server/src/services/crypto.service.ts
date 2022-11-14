/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const keyBase64 = 's9p1PG9edXqxNWaBXORZ1SPVSQ7Gwan5XgKlAudOkBI=';

class CryptoService {
  encrypt(text: string) {
    if (!text) return '';
    const iv = crypto.randomBytes(16); // Blocklänge: 128 Bit
    const key = Buffer.from(keyBase64, 'base64');
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const ivPlusCipherText = Buffer.concat([iv, cipher.update(text, 'utf8'), cipher.final()]);
    return ivPlusCipherText.toString('base64');
  }

  decrypt(ivPlusCipherTextBase64: string) {
    if (!ivPlusCipherTextBase64) return '';
    const buffer = Buffer.from(ivPlusCipherTextBase64, 'base64');
    const [iv, ciphertext] = [buffer.slice(0, 16), buffer.slice(16)];
    const key = Buffer.from(keyBase64, 'base64');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
  }
}

export const cryptoService = new CryptoService();
