import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useForm({ defaultValues: { name: user.name } });
  const password = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function saveProfile(values) {
    try {
      const result = await api("/api/auth/me", {
        method: "PATCH",
        body: { name: values.name.trim() },
      });
      updateUser(result.user);
      profile.reset({ name: result.user.name });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
      toast.success("Profile updated successfully.");
    } catch (error) {
      profile.setError("root", { message: error.message });
      toast.error(error.message);
    }
  }

  async function savePassword(values) {
    try {
      await api("/api/auth/password", {
        method: "PATCH",
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });
      password.reset();
      toast.success("Password updated successfully.");
    } catch (error) {
      password.setError("root", { message: error.message });
      toast.error(error.message);
    }
  }

  function signOut() {
    logout();
    navigate("/login", { replace: true });
    toast.success("You’ve been logged out.");
  }

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Your account
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Manage your profile and keep your account secure.
          </p>
        </header>

        <section aria-labelledby="profile-heading" className={cardClass}>
          <h2
            id="profile-heading"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Profile
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your name is shown on your listings and in conversations.
          </p>
          <form
            noValidate
            onSubmit={profile.handleSubmit(saveProfile)}
            className="mt-6 space-y-5"
          >
            <fieldset
              disabled={profile.formState.isSubmitting}
              className="space-y-5"
            >
              <Field
                label="Display name"
                id="name"
                error={profile.formState.errors.name}
              >
                <Input
                  id="name"
                  autoComplete="name"
                  aria-invalid={Boolean(profile.formState.errors.name)}
                  aria-describedby={
                    profile.formState.errors.name ? "name-error" : undefined
                  }
                  {...profile.register("name", {
                    validate: (value) =>
                      (value.trim().length >= 2 &&
                        value.trim().length <= 100) ||
                      "Name must be between 2 and 100 characters",
                  })}
                />
              </Field>
              <div>
                <label
                  htmlFor="settings-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <Input
                  id="settings-email"
                  type="email"
                  readOnly
                  value={user.email}
                  aria-describedby="email-help"
                />
                <p
                  id="email-help"
                  className="mt-2 text-xs leading-5 text-slate-500"
                >
                  Your sign-in email. Email changes are currently unavailable.
                </p>
              </div>
            </fieldset>
            {profile.formState.errors.root && (
              <p role="alert" className="text-sm text-red-600">
                {profile.formState.errors.root.message}
              </p>
            )}
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button
                type="submit"
                disabled={
                  !profile.formState.isDirty || profile.formState.isSubmitting
                }
              >
                {profile.formState.isSubmitting ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </section>

        <section aria-labelledby="password-heading" className={cardClass}>
          <h2
            id="password-heading"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Change password
          </h2>
          <p
            id="password-help"
            className="mt-2 text-sm leading-6 text-slate-500"
          >
            Use at least 8 characters and choose a password you don’t use
            elsewhere.
          </p>
          <form
            noValidate
            onSubmit={password.handleSubmit(savePassword)}
            className="mt-6 space-y-5"
          >
            <fieldset
              disabled={password.formState.isSubmitting}
              className="space-y-5"
            >
              {[
                {
                  name: "currentPassword",
                  label: "Current password",
                  autoComplete: "current-password",
                  rules: { required: "Enter your current password" },
                },
                {
                  name: "newPassword",
                  label: "New password",
                  autoComplete: "new-password",
                  rules: {
                    required: "Enter a new password",
                    minLength: {
                      value: 8,
                      message: "Use at least 8 characters",
                    },
                    validate: {
                      different: (value) =>
                        value !== password.getValues("currentPassword") ||
                        "Choose a different password",
                      length: (value) =>
                        new TextEncoder().encode(value).length <= 72 ||
                        "Use 72 UTF-8 bytes or fewer",
                    },
                    deps: ["confirmPassword"],
                  },
                },
                {
                  name: "confirmPassword",
                  label: "Confirm new password",
                  autoComplete: "new-password",
                  rules: {
                    required: "Confirm your new password",
                    validate: (value) =>
                      value === password.getValues("newPassword") ||
                      "Passwords do not match",
                  },
                },
              ].map((field) => (
                <Field
                  key={field.name}
                  id={field.name}
                  label={field.label}
                  error={password.formState.errors[field.name]}
                >
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete={field.autoComplete}
                    aria-invalid={Boolean(
                      password.formState.errors[field.name],
                    )}
                    aria-describedby={
                      password.formState.errors[field.name]
                        ? `${field.name}-error`
                        : field.name === "newPassword"
                          ? "password-help"
                          : undefined
                    }
                    {...password.register(field.name, field.rules)}
                  />
                </Field>
              ))}
            </fieldset>
            {password.formState.errors.root && (
              <p role="alert" className="text-sm text-red-600">
                {password.formState.errors.root.message}
              </p>
            )}
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button type="submit" disabled={password.formState.isSubmitting}>
                {password.formState.isSubmitting
                  ? "Updating..."
                  : "Update password"}
              </Button>
            </div>
          </form>
        </section>

        <section aria-labelledby="session-heading" className={cardClass}>
          <h2
            id="session-heading"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Current session
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign out of Campus Marketplace on this browser.
          </p>
          <button
            type="button"
            onClick={signOut}
            disabled={
              profile.formState.isSubmitting || password.formState.isSubmitting
            }
            className="mt-5 rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 disabled:opacity-60"
          >
            Sign out
          </button>
        </section>
      </div>
    </main>
  );
}
