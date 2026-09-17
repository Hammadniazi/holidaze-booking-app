import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/index";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/api/client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const LoginPage = () => {
  useDocumentTitle("Log in");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // Where the visitor was sent from, e.g. the venue they tried to book.
  // Validated on the route to same-site paths only.
  const { redirect }: { redirect?: string } = useSearch({ from: "/login" });
  const [serverError, setServerError] = useState<string | null>(null);

  // Already signed in (a bookmark, or Back after logging in): nothing to do
  // here. Also carries a fresh login on to its destination.
  useEffect(() => {
    if (isAuthenticated) void navigate({ href: redirect ?? "/", replace: true });
  }, [isAuthenticated, navigate, redirect]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      // The effect above navigates once the store reports the new session.
      await login(data.email, data.password);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Login failed. Please try again.";
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary)/10 mb-4" aria-hidden="true">
            <MapPin className="h-6 w-6 text-(--color-primary)" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-(--color-muted-foreground) mt-1">
            Sign in to your Holidaze account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your stud.noroff.no credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <Alert variant="destructive" className="mb-4" focusOnMount>
                {serverError}
              </Alert>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
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
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-(--color-muted-foreground)">
              Don't have an account?{" "}
              <Link
                to="/register"
                search={{ redirect }}
                className="text-(--color-primary) hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
