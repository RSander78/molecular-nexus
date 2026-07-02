"use client";

import { Users, Shield } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Team-Verwaltung</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Teams erstellen, Mitglieder einladen und Analysen teilen
        </p>
      </div>

      <div className="text-center py-12 bg-card border border-border rounded-lg">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Enterprise-Funktion</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Die Team-Verwaltung ermöglicht es Ihnen, Kollegen einzuladen, 
          Analysen zu teilen und gemeinsam an Projekten zu arbeiten.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Verfügbar mit Enterprise-Lizenz</span>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h4 className="font-medium text-sm mb-2">Team erstellen</h4>
          <p className="text-xs text-muted-foreground">
            Erstellen Sie Teams für verschiedene Abteilungen oder Projekte
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h4 className="font-medium text-sm mb-2">Mitglieder einladen</h4>
          <p className="text-xs text-muted-foreground">
            Laden Sie Kollegen per E-Mail ein und weisen Sie Rollen zu
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h4 className="font-medium text-sm mb-2">Analysen teilen</h4>
          <p className="text-xs text-muted-foreground">
            Teilen Sie Ergebnisse und arbeiten Sie gemeinsam an Analysen
          </p>
        </div>
      </div>
    </div>
  );
}
