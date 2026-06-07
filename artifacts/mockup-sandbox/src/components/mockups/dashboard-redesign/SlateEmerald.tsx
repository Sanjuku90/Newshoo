import { TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, LayoutDashboard, LineChart, Users, Settings, Bell, ArrowUpRight, ArrowDownRight, Gem, CheckCircle } from "lucide-react";

const stats = [
  { label: "Solde principal", value: "$2,840", delta: "+$142", up: true, icon: Wallet },
  { label: "Investi", value: "$1,500", delta: "3 actifs", up: true, icon: TrendingUp },
  { label: "Gains totaux", value: "$340", delta: "+$53/j", up: true, icon: ArrowUpRight },
  { label: "Retrait dispo", value: "$0", delta: "Min. $9", up: false, icon: ArrowDownToLine },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Investir", icon: TrendingUp },
  { label: "Dépôt", icon: ArrowDownToLine },
  { label: "Retrait", icon: ArrowUpFromLine },
  { label: "Historique", icon: LineChart },
  { label: "Parrainage", icon: Users },
  { label: "Paramètres", icon: Settings },
];

const plans = [
  { name: "Pack GOLD", invested: 500, total: 750, daily: 36, progress: 60, color: "#10b981" },
  { name: "Pack SILVER", invested: 200, total: 255, daily: 17, progress: 80, color: "#10b981" },
  { name: "Pack BRONZE", invested: 800, total: 1500, daily: 10, progress: 40, color: "#10b981" },
];

const txs = [
  { icon: ArrowDownToLine, label: "Dépôt approuvé", amount: "+$500.00", date: "Aujourd'hui, 14:32", green: true },
  { icon: TrendingUp, label: "Gain Pack GOLD", amount: "+$36.00", date: "Aujourd'hui, 00:01", green: true },
  { icon: ArrowUpFromLine, label: "Retrait traité", amount: "-$120.00", date: "Hier, 11:05", green: false },
  { icon: TrendingUp, label: "Gain Pack SILVER", amount: "+$17.00", date: "Hier, 00:01", green: true },
];

export function SlateEmerald() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0c0e11", minHeight: "100vh", display: "flex", color: "#e5e7eb" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#0c0e11", borderRight: "1px solid #1a1d23", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gem size={15} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.4px" }}>InvestPro</span>
        </div>

        {/* Profile */}
        <div style={{ margin: "0 12px 16px", padding: "11px 13px", background: "#13161b", border: "1px solid #1e2229", borderRadius: 10, display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#10b98120", border: "1.5px solid #10b98150", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#10b981" }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f3f4f6" }}>Alex Martin</div>
            <div style={{ fontSize: 10, color: "#4b5563" }}>Niveau 2 · KYC ✓</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
          {navItems.map(({ label, icon: Icon, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, cursor: "pointer",
              background: active ? "#10b98112" : "transparent",
              color: active ? "#10b981" : "#4b5563",
              fontSize: 13, fontWeight: active ? 600 : 400,
            }}>
              <Icon size={14} />
              {label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />}
            </div>
          ))}
        </nav>

        {/* KYC badge */}
        <div style={{ margin: "12px 12px 20px", padding: "10px 12px", background: "#10b98108", border: "1px solid #10b98120", borderRadius: 9, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={13} color="#10b981" />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#10b981" }}>Compte vérifié</div>
            <div style={{ fontSize: 9, color: "#374151" }}>KYC niveau 1 approuvé</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{ height: 58, background: "#0c0e11", borderBottom: "1px solid #1a1d23", display: "flex", alignItems: "center", padding: "0 24px", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb" }}>Vue d'ensemble</div>
            <div style={{ fontSize: 10, color: "#374151" }}>Mis à jour il y a 2 min</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#10b981", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "white", border: "none", cursor: "pointer" }}>
              <ArrowDownToLine size={12} />
              Déposer
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#13161b", border: "1px solid #1e2229", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "#6b7280", cursor: "pointer" }}>
              <ArrowUpFromLine size={12} />
              Retirer
            </button>
          </div>
          <div style={{ width: 34, height: 34, background: "#13161b", border: "1px solid #1e2229", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Bell size={14} color="#6b7280" />
            <div style={{ position: "absolute", top: 7, right: 7, width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
          </div>
        </header>

        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Hero summary card */}
          <div style={{ background: "linear-gradient(135deg, #13161b, #161a21)", border: "1px solid #1e2229", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, color: "#4b5563", fontWeight: 500, marginBottom: 4 }}>PORTEFEUILLE TOTAL</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#f9fafb", letterSpacing: "-1px" }}>$4,340<span style={{ fontSize: 18, color: "#4b5563" }}>.00</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <ArrowUpRight size={13} color="#10b981" />
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>+$53 aujourd'hui</span>
                <span style={{ fontSize: 11, color: "#374151" }}>· 3 investissements actifs</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[{ l: "Solde", v: "$2,840", c: "#f9fafb" }, { l: "Investi", v: "$1,500", c: "#f9fafb" }].map(({ l, v, c }) => (
                <div key={l} style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {stats.map(({ label, value, delta, up, icon: Icon }) => (
              <div key={label} style={{ background: "#13161b", border: "1px solid #1e2229", borderRadius: 11, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "#4b5563", fontWeight: 500 }}>{label}</div>
                  <Icon size={12} color="#374151" />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.3px" }}>{value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 5, fontSize: 10 }}>
                  {up ? <ArrowUpRight size={10} color="#10b981" /> : <ArrowDownRight size={10} color="#6b7280" />}
                  <span style={{ color: up ? "#10b981" : "#6b7280" }}>{delta}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
            {/* Plans */}
            <div style={{ background: "#13161b", border: "1px solid #1e2229", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb" }}>Investissements en cours</div>
                <div style={{ fontSize: 11, color: "#10b981", cursor: "pointer" }}>Tout voir</div>
              </div>
              {plans.map(({ name, invested, total, daily, progress }) => (
                <div key={name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e5e7eb" }}>{name}</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: "#374151" }}>${invested} → ${total}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>+${daily}/j</span>
                  </div>
                  <div style={{ height: 5, background: "#1e2229", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "#10b981", borderRadius: 99 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: "#374151" }}>{progress}% complété</span>
                    <span style={{ fontSize: 9, color: "#374151" }}>{100 - progress}% restant</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div style={{ background: "#13161b", border: "1px solid #1e2229", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb" }}>Activité</div>
                <div style={{ fontSize: 11, color: "#10b981", cursor: "pointer" }}>Historique</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {txs.map((tx, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < txs.length - 1 ? "1px solid #1a1d23" : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: tx.green ? "#10b98110" : "#ef444410", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <tx.icon size={12} color={tx.green ? "#10b981" : "#ef4444"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#e5e7eb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.label}</div>
                      <div style={{ fontSize: 9, color: "#374151", marginTop: 1 }}>{tx.date}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: tx.green ? "#10b981" : "#ef4444", flexShrink: 0 }}>{tx.amount}</div>
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
