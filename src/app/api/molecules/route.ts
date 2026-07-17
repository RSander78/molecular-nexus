import { NextResponse } from "next/server";
import { searchMolecule, PubChemServiceError } from "@/lib/pubchem";

const VALID_TYPES = ["name", "smiles", "formula"] as const;

export async function POST(request: Request) {
  let query: unknown;
  let type: unknown;
  try {
    ({ query, type } = await request.json());
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  if (typeof query !== "string" || !query.trim() || typeof type !== "string") {
    return NextResponse.json({ error: "Query und Typ sind erforderlich" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "Ungültiger Suchtyp" }, { status: 400 });
  }

  try {
    const result = await searchMolecule(query, type as (typeof VALID_TYPES)[number]);
    if (!result) {
      return NextResponse.json({ error: "Keine Ergebnisse gefunden" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    // Upstream (PubChem) failures are reported as 502 so they are not confused
    // with a genuine "no results" (404) or an internal bug (500).
    if (error instanceof PubChemServiceError) {
      console.error("PubChem upstream error:", error);
      return NextResponse.json(
        { error: "PubChem-Dienst derzeit nicht erreichbar. Bitte später erneut versuchen." },
        { status: 502 }
      );
    }
    console.error("Molecule search error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
