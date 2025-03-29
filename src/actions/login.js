"use server";

import { loginRules } from "@/lib/arcjet";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { request } from "@arcjet/next";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password should have at least 6 characters" }),
});

export async function loginUserServerAction(formData) {
  //chat
  // for (const pair of formData.entries()) {
  //   console.log(pair[0] + ": " + pair[1]);
  // }

  const validatedResult = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedResult.success) {
    return {
      error: validatedResult.error.errors[0].message,
      status: 400,
    };
  }

  const { email, password } = validatedResult.data;

  try {
    const req = await request();
    const decision = await loginRules.protect(req, {
      email,
    });

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        const emailTypes = decision.reason.emailTypes;
        if (emailTypes.includes("DISPOSABLE")) {
          return {
            error: "Disposable emails are not allowed",
            status: 403,
          };
        } else if (emailTypes.includes("INVALID")) {
          return {
            error: "Invalid email! Please provide a valid email",
            status: 403,
          };
        } else if (emailTypes.includes("NO_MX_RECORDS")) {
          return {
            error: "Email provided does not have MX records",
            status: 403,
          };
        } else {
          return {
            error:
              "Email provided is not accepted! Please provide a different email",
            status: 403,
          };
        }
      } else if (decision.reason.isBot()) {
        return {
          error: "Bot activity was detected! You have been temporarily blocked",
          status: 403,
        };
      } else if (decision.reason.isShield()) {
        return {
          error:
            "Suspicious activity was detected! You have been temporarily blocked",
          status: 403,
        };
      }
      // else if (decision.reason.isRateLimit()) {
      //   return {
      //     error: "Too many requests! Please try again later",
      //     status: 429,
      //   };
      // }
    }

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return {
        error: "User not found!",
        status: 401,
      };
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return {
        error: "Invalid credentials",
        status: 401,
      };
    }

    //token
    const userToken = await new SignJWT({
      userId: user._id.toString(),
      email: user.email,
      username: user.name,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("2hr")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    (await cookies()).set("token", userToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7200,
      path: "/",
    });

    return {
      success: "Login successful",
      status: 200,
    };
  } catch (error) {
    console.error("Login error! Failed", error);
    return {
      error: "Internal server error",
      status: 500,
    };
  }
}
