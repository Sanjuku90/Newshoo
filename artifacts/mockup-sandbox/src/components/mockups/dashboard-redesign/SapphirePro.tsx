import { TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, LayoutDashboard, LineChart, Users, Settings, Bell, ChevronRight, ArrowUpRight, ArrowDownRight, Zap, Activity } from "lucide-react";

const stats = [
  { label: "Solde disponible", value: "$2,840", sub: "+$142 ce mois", up: true, icon: Wallet, grad: ["#0ea5e9", "#0284c7"] },
  { label: "Capital investi", value: "$1,500", sub: "3 packs actifs", up: true, icon: TrendingUp, grad: ["#6366f1", "#4f46e5"] },
  { label: "Gains totaux", value: "$340", sub: "+$36 aujourd'hui", up: true, icon: Activity, grad: ["#10b981", "#059669"] },
  { label: "Prochain gain", value: "$53", sub: "Dans ~18h", up: true, icon: Zap, grad: ["#f59e0b", "#d97706"] },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Investir", icon: TrendingUp },
  { label: "Dépôt", icon: ArrowDownToLine },
  { label: "Retrait", icon: ArrowUpFromLine },
  { label: "Analytique", icon: LineChart },
  { label: "Parrainage", icon: Users },
];

const investments = [
  { plan: "Pack GOLD", amount: "$500", daily: "+$36/j", progress: 60, daysLeft: 6, color: "#f59e0b" },
  { plan: "Pack SILVER", amount: "$200", daily: "+$17/j", progress: 80, daysLeft: 3, color: "#6366f1" },
  { plan: "Pack BRONZE", amount: "$800", daily: "+$10/j", progress: 40, daysLeft: 9, color: "#0ea5e9" },
];

const txs = [
  { type: "Dépôt USDT", amount: "+$500.00", date: "03 Jun 2026", up: true },
  { type: "Gain quotidien", amount: "+$36.00", date: "02 Jun 2026", up: true },
  { type: "Retrait", amount: "-$120.00", date: "01 Jun 2026", up: false },
  { type: "Gain quotidien", amount: "+$17.00", date: "01 Jun 2026", up: true },
];

export function SapphirePro() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#060d1f", minHeight: "100vh", display: "flex", color: "#e2e8f0" }}>
      {/* Sidebar */}
      <aside style={{ width: 236, background: "linear-gradient(180deg, #060d1f 0%, #0a1628 100%)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px #0ea5e940" }}>
              <Zap size={17} color="white" fill="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>InvestPro</div>
              <div style={{ fontSize: 9, color: "#334155", letterSpacing: "1.5px", fontWeight: 600 }}>PLATEFORME</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ margin: "0 14px 14px", padding: "14px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white" }}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Alex Martin</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontSize: 10, color: "#64748b" }}>VIP · Niveau 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ fontSize: 9, fontWeight: 700, color: "#334155", letterSpacing: "1.2px", padding: "0 20px 8px" }}>NAVIGATION</div>
        <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ label, icon: Icon, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 9, cursor: "pointer",
              background: active ? "rgba(14,165,233,0.1)" : "transparent",
              color: active ? "#38bdf8" : "#475569",
              fontSize: 13, fontWeight: active ? 700 : 500,
              borderLeft: active ? "2px solid #0ea5e9" : "2px solid transparent",
            }}>
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={12} style={{ marginLeft: "auto" }} color="#38bdf8" />}
            </div>
          ))}
        </nav>

        <div style={{ padding: "12px 10px 22px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 9, color: "#334155", fontSize: 13, cursor: "pointer" }}>
            <Settings size={15} />
            Paramètres
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ height: 64, background: "rgba(6,13,31,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 28px", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Tableau de bord</div>
            <div style={{ fontSize: 11, color: "#334155" }}>Lundi 7 juin 2026</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 8, fontSize: 12, color: "#38bdf8", cursor: "pointer" }}>
            <ArrowDownToLine size={13} />
            Déposer
          </div>
          <div style={{ position: "relative", width: 36, height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Bell size={15} color="#475569" />
            <div style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", border: "1.5px solid #060d1f" }} />
          </div>
        </header>

        <div style={{ flex: 1, padding: "22px 26px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Welcome banner */}
          <div style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.08) 100%)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 14, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>Bonjour, Alex 👋</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Vos investissements génèrent <span style={{ color: "#10b981", fontWeight: 700 }}>+$53</span> aujourd'hui</div>
            </div>
            <div style={{ fontSize: 28 }}>📈</div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {stats.map(({ label, value, sub, up, icon: Icon, grad }) => (
              <div key={label} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "16px", backdropFilter: "blur(8px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{label}</div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${grad[0]}20, ${grad[1]}10)`, border: `1px solid ${grad[0]}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={13} color={grad[0]} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 4 }}>{value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  {up ? <ArrowUpRight size={11} color="#10b981" /> : <ArrowDownRight size={11} color="#ef4444" />}
                  <span style={{ color: up ? "#10b981" : "#ef4444" }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Split */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14 }}>
            {/* Investments */}
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>Investissements actifs</div>
                <div style={{ fontSize: 11, color: "#0ea5e9", cursor: "pointer", fontWeight: 600 }}>Tout voir →</div>
              </div>
              {investments.map(({ plan, amount, daily, progress, daysLeft, color }) => (
                <div key={plan} style={{ marginBottom: 12, padding: "13px 15px", background: "rgba(6,13,31,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}80` }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{plan}</div>
                        <div style={{ fontSize: 10, color: "#475569" }}>{daysLeft} jours restants</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{daily}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>{amount} déposé</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 99, boxShadow: `0 0 8px ${color}60` }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#334155", marginTop: 5, textAlign: "right" }}>{progress}% complété</div>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>Activité récente</div>
                <div style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 600, cursor: "pointer" }}>Tout voir →</div>
              </div>
              {txs.map((tx, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: i < txs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: tx.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${tx.up ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {tx.up ? <ArrowDownToLine size={13} color="#10b981" /> : <ArrowUpFromLine size={13} color="#ef4444" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{tx.type}</div>
                    <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>{tx.date}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: tx.up ? "#10b981" : "#ef4444" }}>{tx.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
