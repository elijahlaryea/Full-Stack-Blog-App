import { verifyAuthentication } from "@/lib/auth";
import Header from "./header";
import { cookies } from "next/headers";

async function CommonLayout({ children }) {
  const token = (await cookies()).get("token")?.value;
  const user = await verifyAuthentication(token);

  const isAuthenticated = false;

  return (
    <div className="min-h-screen bg-white">
      {user && <Header />}
      {children}
    </div>
  );
}

export default CommonLayout;
