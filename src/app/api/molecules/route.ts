import { NextResponse } from "next/server";
import { searchMolecule } from "@/lib/pubchem";

export async function POST(request: Request) {
  try {
    const { query, type } = await request.json();
    if (!query || !type) {
      return NextResponse.json({ error: "Query und Typ sind erforderlich" }, { status: 400 });
    }

    const result = await searchMolecule(query, type);
    if (!result) {
      return NextResponse.json({ error: "Keine Ergebnisse gefunden" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Molecule search error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
