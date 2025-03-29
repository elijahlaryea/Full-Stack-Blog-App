import { jwtVerify } from "jose";

export async function verifyAuthentication(token) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };
  } catch (e) {
    console.error(e, "Error fetching user token");

    return null;
  }
}
