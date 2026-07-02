"use client";

import Link from "next/link";
import {
  Search,
  FlaskConical,
  Zap,
  BarChart3,
  Calculator,
  Atom,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    href: "/dashboard/molecules",
    icon: Search,
    title: "Molekülsuche",
    description: "PubChem-Datenbank durchsuchen, 2D/3D-Visualisierung",
  },
  {
    href: "/dashboard/admet",
    icon: FlaskConical,
    title: "ADMET-Vorhersage",
    description: "Absorption, Toxizität, Bioverfügbarkeit",
  },
  {
    href: "/dashboard/reactions",
    icon: Zap,
    title: "Reaktionsvorhersage",
    description: "Produkte und Mechanismen vorhersagen",
  },
  {
    href: "/dashboard/qsar",
    icon: BarChart3,
    title: "QSAR/QSPR",
    description: "Struktur-Aktivitäts-Beziehungen",
  },
  {
    href: "/dashboard/calculations",
    icon: Calculator,
    title: "Berechnungen",
    description: "Molmasse, pH, Stöchiometrie, Verdünnung",
  },
  {
    href: "/dashboard/quantum",
    icon: Atom,
    title: "Quantenchemie",
    description: "Orbitale, Energieniveaus, Spektroskopie",
  },
  {
    href: "/dashboard/agent",
    icon: MessageSquare,
    title: "Chemie-Assistent",
    description: "KI-gestützter Fachassistent für alle Fragen",
  },
];

const quickMolecules = [
  { name: "Aspirin", formula: "C9H8O4", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
  { name: "Koffein", formula: "C8H10N4O2", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
  { name: "Ibuprofen", formula: "C13H18O2", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" },
  { name: "Ethanol", formula: "C2H6O", smiles: "CCO" },
  { name: "Glucose", formula: "C6H12O6", smiles: "OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O" },
  { name: "Paracetamol", formula: "C8H9NO2", smiles: "CC(=O)NC1=CC=C(O)C=C1" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Willkommen bei Molecular Nexus
        </h1>
        <p className="text-muted-foreground mt-1">
          Ihre Plattform für chemische Analyse und Vorhersage
        </p>
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Module</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group bg-card border border-border rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <module.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{module.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {module.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Start Molecules */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Schnellzugriff – Häufige Moleküle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickMolecules.map((mol) => (
            <Link
              key={mol.name}
              href={`/dashboard/molecules?q=${encodeURIComponent(mol.name)}&type=name`}
              className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-mono text-xs font-medium">
                {mol.formula.slice(0, 3)}
              </div>
              <div>
                <p className="font-medium text-sm">{mol.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{mol.formula}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
