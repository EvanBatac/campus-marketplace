import { useToast } from "../hooks/useToast";

/* eslint-disable react-refresh/only-export-components */
import { api } from "../api/client";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters"),

    email: z.email("Enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data) {
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...payload } = data;
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: payload,
      });
      toast.success("Account created! Log in to get started.");
      navigate("/login");
    } catch (err) {
      setError("root", { message: err.message });
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  }
  const fields = [
    {
      name: "name",
      label: "Full name",
      type: "text",
      placeholder: "John Doe",
      autoComplete: "name",
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      placeholder: "you@example.com",
      autoComplete: "email",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      type: "password",
      placeholder: "Confirm your password",
      autoComplete: "new-password",
    },
  ];

  return (
    <main className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <section
        aria-labelledby="register-heading"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10"
      >
        <div className="mb-8">
          <div
            aria-hidden="true"
            className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3 9 9-5 9 5-9 5-9-5Zm4 2.3V17c3 2.7 7 2.7 10 0v-5.7M21 9v7"
              />
            </svg>
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Your campus, connected
          </p>
          <h1
            id="register-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Create an account
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Join your campus community to buy, sell, and connect.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={
                  errors[field.name]
                    ? `${field.name}-error`
                    : field.name === "password"
                      ? "password-hint"
                      : undefined
                }
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors[field.name] ? "border-red-400" : "border-slate-300"}`}
                {...register(field.name)}
              />
              {field.name === "password" && !errors.password && (
                <p id="password-hint" className="mt-2 text-xs text-slate-500">
                  Use at least 8 characters.
                </p>
              )}
              {errors[field.name] && (
                <p
                  id={`${field.name}-error`}
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors[field.name].message}
                </p>
              )}
            </div>
          ))}
          {errors.root && (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.message}
            </p>
          )}
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
