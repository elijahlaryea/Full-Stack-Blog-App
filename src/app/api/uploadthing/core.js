import { verifyAuthentication } from "@/lib/auth";
import { cookies } from "next/headers";
import { createUploadthing } from "uploadthing/next";

const fxn = createUploadthing();

export const myFileRouter = {
  imageUploader: fxn({ image: { maxFileSize: "4MB" } })
    .middleware(async (req) => {
      const token = (await cookies()).get("token")?.value;
      const user = await verifyAuthentication(token);

      return {
        userId: user?.userId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(metadata.userId);
      console.log(file.ufsUrl);
    }),
};
