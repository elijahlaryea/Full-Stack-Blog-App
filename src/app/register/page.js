import RegisterForm from "@/components/auth/RegisterForm";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function RegisterPage() {
  const token = (await cookies()).get("token")?.value;

  if (token) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">
              Register
            </h1>
            <p className="text-sm text-gray-500">
              Create Account to get started
            </p>
            <RegisterForm />
            <p className="text-center text-sm text-gray-600">
              Already Registered?
              <Link
                href={"/login"}
                className="font-semibold ml-3 text-black hover:text-black"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden md:flex w-1/2 p-12 items-center justify-center relative">
        <div className="max-w-lg space-y-6 text-white z-10">
          <h2 className="text-4xl text-black font-medium">
            Experience a <strong>New World</strong> of Communication
          </h2>
          <p className="text-right text-lg text-black font-bold">- Blogify</p>
        </div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <img
          src="images/auth.jpg"
          alt="worksapce"
          className="absolute inset-0 object-cover w-full h-full"
        />
      </div>
    </div>
  );
}

export default RegisterPage;
