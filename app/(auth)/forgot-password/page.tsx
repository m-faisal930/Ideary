"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import Image from "next/image";


type FormValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Reset link sent to your email");
      } else {
        toast.error(data.error || data.message || "Something went wrong");
      }
    } catch  {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 font-sans">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link
          href="/"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 "
        >
                    <Image src="/logo.png" alt="logo" width={200} height={200} />
        </Link>
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mt-4 ml-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Link>
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2x">
              Forgot Password
            </h1>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white p-6 rounded shadow w-96 text-gray-800"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border p-2 rounded mb-4"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
              <br />
              <Button
                type="submit"
                className="w-full text-white bg-gray-900 hover:bg-gray-700 hover:cursor-pointer focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-4 border-white border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}