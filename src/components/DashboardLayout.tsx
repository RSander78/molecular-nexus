"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  FlaskConical,
  Zap,
  BarChart3,
  Calculator,
  Atom,
  History,
  Users,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/agent", label: "Chemie-Assistent", icon: MessageSquare },
  { href: "/dashboard/molecules", label: "Molekülsuche", icon: Search },
  { href: "/dashboard/admet", label: "ADMET-Vorhersage", icon: FlaskConical },
  { href: "/dashboard/reactions", label: "Reaktionsvorhersage", icon: Zap },
  { href: "/dashboard/qsar", label: "QSAR/QSPR", icon: BarChart3 },
  { href: "/dashboard/calculations", label: "Berechnungen", icon: Calculator },
  { href: "/dashboard/quantum", label: "Quantenchemie", icon: Atom },
  { href: "/dashboard/history", label: "Analyse-Historie", icon: History },
  { href: "/dashboard/team", label: "Team-Verwaltung", icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a1628] text-white transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-lg font-bold tracking-tight">Molecular Nexus</h1>
            <p className="text-xs text-white/50 mt-1">Chemie-Analyseplattform</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm mb-1 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">
                MN
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Molecular Nexus</p>
                <p className="text-xs text-white/50 truncate">Enterprise Edition</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-accent"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-semibold">Molecular Nexus</h2>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
