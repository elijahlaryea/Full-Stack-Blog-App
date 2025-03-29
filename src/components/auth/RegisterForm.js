"use client";

import { Key, Mail, User } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { registerUserServerAction } from "@/actions/register";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z
    .string()
    .min(3, { message: "Name should have at least 3 characters" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password should have at least 6 characters" }),
});

function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      console.log(data);
      const formData = new FormData();
      Object.keys(data).forEach((key) => formData.append(key, data[key]));
      // Object.keys(data).forEach((key) => formData.append(key, data[key]));

      const result = await registerUserServerAction(formData);

      console.log(result, "result");

      if (result.success) {
        toast("Registration successful", {
          description: result?.success,
        });
        router.push("/login");
      } else {
        throw new Error(result.error || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      toast("Registration failed", {
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-2 h-5 w-5 text-gray-500" />
          <Input
            {...register("name")}
            placeholder="Enter name here..."
            diasbled={isLoading}
            className="pl-10 bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-2 h-5 w-5 text-gray-500" />
          <Input
            type="email"
            {...register("email")}
            placeholder="Enter email here..."
            diasbled={isLoading}
            className="pl-10 bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>
        <div className="relative">
          <Key className="absolute left-3 top-2 h-5 w-5 text-gray-500" />
          <Input
            type="password"
            {...register("password")}
            placeholder="Enter strong password..."
            diasbled={isLoading}
            className="pl-10 bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>
      </div>
      <Button
        type="submit"
        diasbled={isLoading}
        className="w-full mt-3 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Register
      </Button>
    </form>
  );
}

export default RegisterForm;
