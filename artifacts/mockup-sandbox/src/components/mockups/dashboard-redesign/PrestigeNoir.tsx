import { TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, LayoutDashboard, LineChart, Users, Settings, Bell, ChevronRight, ArrowUpRight, ArrowDownRight, Shield, Star } from "lucide-react";

const stats = [
  { label: "Solde disponible", value: "$2,840.00", change: "+5.2%", up: true, icon: Wallet, color: "#f59e0b" },
  { label: "Capital investi", value: "$1,500.00", change: "Actif", up: true, icon: TrendingUp, color: "#f59e0b" },
  { label: "Gains totaux", value: "$340.00", change: "+12.8%", up: true, icon: ArrowUpRight, color: "#f59e0b" },
  { label: "En retrait", value: "$0.00", change: "Disponible", up: true, icon: ArrowDownToLine, color: "#a3a3a3" },
];

const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, active: true },
  { label: "Investir", icon: TrendingUp },
  { label: "Dépôt", icon: ArrowDownToLine },
  { label: "Retrait", icon: ArrowUpFromLine },
  { label: "Historique", icon: LineChart },
  { label: "Parrainage", icon: Users },
];

const investments = [
  { plan: "Pack GOLD", amount: "$500", daily: "$36/j", progress: 60, days: "6 jr restants" },
  { plan: "Pack SILVER", amount: "$200", daily: "$17/j", progress: 80, days: "3 jr restants" },
  { plan: "Pack BRONZE", amount: "$800", daily: "$10/j", progress: 40, days: "9 jr restants" },
];

const txs = [
  { type: "Dépôt", amount: "+$500", date: "03 Jun", status: "Approuvé", up: true },
  { type: "Gain quotidien", amount: "+$36", date: "02 Jun", status: "Crédité", up: true },
  { type: "Retrait", amount: "-$120", date: "01 Jun", status: "Traité", up: false },
  { type: "Gain quotidien", amount: "+$17", date: "01 Jun", status: "Crédité", up: true },
];

export function PrestigeNoir() {
  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#09090b", minHeight: "100vh", display: "flex", color: "#fafafa" }}>
      {/* Sidebar */}
      <aside style={{ width: 228, background: "#09090b", borderRight: "1px solid #1c1c1e", display: "flex", flexDirection: "column", padding: "0", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #1c1c1e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={16} color="#09090b" fill="#09090b" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px", color: "#fafafa" }}>InvestPro</div>
              <div style={{ fontSize: 10, color: "#737373", letterSpacing: "0.5px" }}>PLATEFORME</div>
            </div>
          </div>
        </div>

        {/* User badge */}
        <div style={{ margin: "16px 16px 8px", background: "#111", border: "1px solid #1c1c1e", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b33, #f59e0b11)", border: "1px solid #f59e0b44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fafafa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Alex Martin</div>
            <div style={{ fontSize: 10, color: "#737373" }}>VIP Niveau 2</div>
          </div>
          <Shield size={13} color="#f59e0b" />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ label, icon: Icon, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer",
              background: active ? "#f59e0b12" : "transparent",
              border: active ? "1px solid #f59e0b22" : "1px solid transparent",
              color: active ? "#f59e0b" : "#737373",
              fontSize: 13, fontWeight: active ? 600 : 400,
              transition: "all 0.15s",
            }}>
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={12} style={{ marginLeft: "auto" }} />}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid #1c1c1e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", color: "#525252", fontSize: 13 }}>
            <Settings size={15} />
            Paramètres
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{ height: 60, borderBottom: "1px solid #1c1c1e", display: "flex", alignItems: "center", padding: "0 28px", gap: 16, background: "#09090b" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fafafa" }}>Bonjour, Alex 👋</div>
            <div style={{ fontSize: 11, color: "#525252" }}>Lundi 7 juin 2026</div>
          </div>
          <div style={{ position: "relative" }}>
            <Bell size={18} color="#525252" />
            <div style={{ position: "absolute", top: -3, right: -3, width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} />
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {stats.map(({ label, value, change, up, icon: Icon, color }) => (
              <div key={label} style={{ background: "#111", border: "1px solid #1c1c1e", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#525252", fontWeight: 500, letterSpacing: "0.3px" }}>{label.toUpperCase()}</div>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={13} color={color} />
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.5px", marginBottom: 6 }}>{value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  {up ? <ArrowUpRight size={11} color="#22c55e" /> : <ArrowDownRight size={11} color="#ef4444" />}
                  <span style={{ color: up ? "#22c55e" : "#a3a3a3" }}>{change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom split */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Investments */}
            <div style={{ background: "#111", border: "1px solid #1c1c1e", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fafafa" }}>Investissements actifs</div>
                <div style={{ fontSize: 11, color: "#f59e0b", cursor: "pointer" }}>Voir tout →</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {investments.map(({ plan, amount, daily, progress, days }) => (
                  <div key={plan} style={{ padding: "12px 14px", background: "#09090b", border: "1px solid #1c1c1e", borderRadius: 9 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>{plan}</div>
                        <div style={{ fontSize: 10, color: "#525252", marginTop: 1 }}>{days}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{daily}</div>
                        <div style={{ fontSize: 10, color: "#525252" }}>{amount}</div>
                      </div>
                    </div>
                    <div style={{ height: 3, background: "#1c1c1e", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div style={{ background: "#111", border: "1px solid #1c1c1e", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fafafa" }}>Transactions récentes</div>
                <div style={{ fontSize: 11, color: "#f59e0b", cursor: "pointer" }}>Historique →</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {txs.map((tx, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#09090b", border: "1px solid #1c1c1e", borderRadius: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: tx.up ? "#22c55e12" : "#ef444412", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {tx.up ? <ArrowDownToLine size={13} color="#22c55e" /> : <ArrowUpFromLine size={13} color="#ef4444" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#fafafa" }}>{tx.type}</div>
                      <div style={{ fontSize: 10, color: "#525252" }}>{tx.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: tx.up ? "#22c55e" : "#ef4444" }}>{tx.amount}</div>
                      <div style={{ fontSize: 10, color: "#525252" }}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
