"use server";

import { cookies } from "next/headers";

export async function logoutUserServerAction() {
  try {
    (await cookies()).delete("token", { path: "/" });

    return {
      success: "Logout successful",
      status: 200,
    };
  } catch (e) {
    return {
      error: "Logout failed! Please try again later",
      status: 500,
    };
  }
}
