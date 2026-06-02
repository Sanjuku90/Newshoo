import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Loader2, AlertCircle, TrendingUp, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    country: "", city: "", password: "", confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();

  const referralCode = new URLSearchParams(window.location.search).get("ref") || undefined;
  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    registerMutation.mutate(
      { data: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, country: form.country, city: form.city, password: form.password, referralCode } },
      {
        onSuccess: (data) => { login(data.token); setLocation("/dashboard"); },
        onError: (err: any) => { setError(err?.data?.error || "Erreur lors de l'inscription. Réessayez."); },
      }
    );
  };

  const field = (id: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <input
        id={id} name={id} type={type} value={form[id]}
        onChange={handle} placeholder={placeholder} required
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
      />
    </div>
  );

  return (
    <div className="w-full max-w-lg">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <TrendingUp className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-bold text-white">InvestPro</span>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-sm text-gray-400">Rejoignez InvestPro et commencez à gagner</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("firstName", "Prénom", "text", "Jean")}
            {field("lastName", "Nom", "text", "Dupont")}
          </div>

          {field("email", "Adresse e-mail", "email", "vous@exemple.com")}
          {field("phone", "Téléphone", "tel", "+225 07 00 00 00 00")}

          <div className="grid grid-cols-2 gap-4">
            {field("country", "Pays", "text", "Côte d'Ivoire")}
            {field("city", "Ville", "text", "Abidjan")}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Mot de passe</label>
            <div className="relative">
              <input
                name="password" type={showPwd ? "text" : "password"}
                value={form.password} onChange={handle}
                placeholder="Minimum 6 caractères" required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Confirmer le mot de passe</label>
            <input
              name="confirmPassword" type="password"
              value={form.confirmPassword} onChange={handle}
              placeholder="••••••••" required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-3.5 rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2">
            {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {registerMutation.isPending ? "Création du compte..." : "Créer mon compte gratuitement"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
            Se connecter
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-gray-700 mt-6">
        En créant un compte, vous acceptez nos{" "}
        <Link href="/terms" className="text-gray-500 hover:text-gray-400 underline">conditions d'utilisation</Link>
        {" "}et notre{" "}
        <Link href="/privacy" className="text-gray-500 hover:text-gray-400 underline">politique de confidentialité</Link>
      </p>
    </div>
  );
}
