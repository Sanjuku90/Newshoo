import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", country: "", city: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();

  const referralCode = new URLSearchParams(window.location.search).get("ref") || undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    registerMutation.mutate(
      { data: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, country: form.country, city: form.city, password: form.password, referralCode } },
      {
        onSuccess: (data) => {
          login(data.token);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Registration failed. Please try again.");
        },
      }
    );
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Join InvestPro and start growing your wealth</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" placeholder="Jean" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" placeholder="Dupont" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" placeholder="France" value={form.country} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Paris" value={form.city} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Already have an account?&nbsp;
        <Link href="/login" className="text-primary hover:underline font-medium">Sign In</Link>
      </CardFooter>
    </Card>
  );
}
