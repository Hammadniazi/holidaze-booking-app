import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { registerSchema, type RegisterInput } from "@/schemas";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/api/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterInput>,
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        bio: data.bio || undefined,
        avatar: data.avatar?.url ? data.avatar : undefined,
      };
      await registerUser(payload);
      void navigate({ to: "/login" });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Registration failed. Please try again.";
      setServerError(message);
    }
  };
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 mb-4">
            <MapPin className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-[var(--color-muted-foreground)] mt-1">
            Join Holidaze today
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Use your stud.noroff.no email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <Alert variant="destructive" className="mb-4">
                {serverError}
              </Alert>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <Input
                id="name"
                label="Username"
                placeholder="your_username"
                autoComplete="username"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="name@stud.noroff.no"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <Input
                id="avatarUrl"
                label="Avatar URL (optional)"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                error={errors.avatar?.url?.message}
                {...register("avatar.url")}
              />

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-[var(--color-muted-foreground)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
