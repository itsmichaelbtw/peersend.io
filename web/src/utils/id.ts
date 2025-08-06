const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function genRandomID(length = 16): string {
  const timestamp = Date.now().toString(36);

  let id = timestamp;

  while (id.length < length) {
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    id += randomChar;
  }

  return id.slice(0, length);
}
