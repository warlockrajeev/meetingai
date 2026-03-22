import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign a JWT token for a user.
 */
export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

/**
 * Verify a JWT token.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Get user from request header.
 */
export async function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  return decoded;
}
