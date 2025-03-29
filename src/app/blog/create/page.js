import CreateBlogForm from "@/components/blog/create-blog-component";
import { verifyAuthentication } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function CreateBlogPage() {
  const token = (await cookies()).get("token")?.value;
  const user = await verifyAuthentication(token);

  return <CreateBlogForm user={user} />;
}
