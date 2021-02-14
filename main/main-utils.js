const crypto = require('crypto');

const encrypt = text => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3', iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex')
  };
};

const decrypt = hash => {
  const decipher = crypto.createDecipheriv('aes-256-ctr', 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3', Buffer.from(hash.iv, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

module.exports = {
  encrypt,
  decrypt
};