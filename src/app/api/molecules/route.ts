import { NextResponse } from "next/server";
import { jsonError, withErrorHandling } from "@/lib/api";
import { searchMolecule } from "@/lib/pubchem";

export const POST = withErrorHandling("Molecule search error", "Interner Serverfehler", async (request) => {
  const { query, type } = await request.json();
  if (!query || !type) {
    return jsonError("Query und Typ sind erforderlich", 400);
  }

  const result = await searchMolecule(query, type);
  if (!result) {
    return jsonError("Keine Ergebnisse gefunden", 404);
  }

  return NextResponse.json(result);
});
