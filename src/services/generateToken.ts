const { nanoid } = require("nanoid");

export async function generateToken() {
  return nanoid(32);
}
