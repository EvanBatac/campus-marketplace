import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  function onSubmit(data) {
    console.log(data);
  }
  return (
    <main className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <section
        aria-labelledby="login-heading"
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
            id="login-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Log in to buy, sell, and connect with your campus community.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.email ? "border-red-400" : "border-slate-300"}`}
              {...register("email")}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.password ? "border-red-400" : "border-slate-300"}`}
              {...register("password")}
            />
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800"
          >
            Log in
          </button>
        </form>

        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          New to Campus Marketplace?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
