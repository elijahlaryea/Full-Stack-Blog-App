"use server";

import { postBlogRules } from "@/lib/arcjet";
import { verifyAuthentication } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import PostBlog from "@/models/PostBlog";
import { request, shield } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Blog title is required"),
  content: z.string().min(1, "Blog content is required"),
  category: z.string().min(1, "Blog category is required"),
  coverPhoto: z.string().min(1, "Blog cover photo is required"),
});

export async function postNewBlogServerAction(data) {
  const token = (await cookies()).get("token")?.value;
  const user = await verifyAuthentication(token);

  if (!user) {
    return {
      error: "User is NOT authenticated",
      status: 401,
    };
  }

  const validateFields = blogSchema.safeParse(data);

  if (!validateFields.success) {
    return {
      error: validateFields.error.errors[0].message,
    };
  }

  const { title, coverPhoto, content, category } = validateFields.data;

  try {
    const req = await request();

    const headerList = await headers();
    const isSuspicious = headerList.get("x-arcjet-suspicious") === "true";

    const decision = await postBlogRules.protect(req, {
      shield: {
        params: {
          title,
          content,
          isSuspicious,
        },
      },
    });

    if (decision.isErrored()) {
      return {
        error: "An error occured! Kindly try again",
      };
    }

    if (decision.isDenied()) {
      if (decision.reason.isShield()) {
        return {
          error:
            "Input failed to validate! Potential malicious activity detected",
        };
      }

      if (decision.reason.isBot()) {
        return {
          error:
            "Bot activity was detected! You have been temporarily blocked!",
        };
      }

      return {
        error: "Request denied",
      };
    }

    //save if no errors or suspicious activities detected
    await connectToDatabase();

    const post = new PostBlog({
      title,
      content,
      author: user.userId,
      coverPhoto,
      category,
      comments: [],
      upvotes: [],
    });

    await post.save();

    revalidatePath("/");

    return {
      success: true,
      post,
    };
  } catch (e) {
    return {
      error: e,
    };
  }
}
