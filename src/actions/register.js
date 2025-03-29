"use server";

import aj from "@/lib/arcjet";
import connectToDatabase from "@/lib/db";
import { request } from "@arcjet/next";
import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "@/models/User";

//register a user
const schema = z.object({
  name: z
    .string()
    .min(3, { message: "Name should have at least 3 characters" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password should have at least 6 characters" }),
});

export async function registerUserServerAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  try {
    const req = await request();
    const decision = await aj.protect(req, { email });

    console.log(decision, "decision");

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
      } else if (decision.reason.isRateLimit()) {
        return {
          error: "Too many requests! Please try again later",
          status: 429,
        };
      }
    }

    //saving to mongodb upon successful registration
    await connectToDatabase();

    const userAlreadyExists = await User.findOne({
      email,
    });

    //checking if user(email) already exists before registering user
    if (userAlreadyExists) {
      return {
        error: "User already exists",
        status: 400,
      };
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const result = new User({
      name,
      email,
      password: hashedPassword,
    });

    await result.save();

    if (result) {
      return {
        success: "User has been successfully registered",
        status: 201,
      };
    } else {
      return {
        error: "User registration was not successful",
        status: 500,
      };
    }
  } catch (error) {
    console.error("Registration error! Failed", error);
    return {
      error: "Internal server error",
      status: 500,
    };
  }
}
