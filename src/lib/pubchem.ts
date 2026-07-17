const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

export interface MoleculeData {
  cid: number;
  name: string;
  molecularFormula: string;
  molecularWeight: number;
  canonicalSmiles: string;
  inchiKey: string;
  xlogp: number | null;
  hbondDonors: number;
  hbondAcceptors: number;
  tpsa: number | null;
  rotatableBonds: number;
  complexity: number | null;
  ghsClassification: GHSData | null;
}

export interface GHSData {
  pictograms: string[];
  hStatements: string[];
  pStatements: string[];
  signalWord: string | null;
}

/**
 * Raised when the PubChem service cannot be reached or returns an unexpected
 * error. Distinct from a successful "no results" lookup (which returns null)
 * so callers can report the two cases differently.
 */
export class PubChemServiceError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "PubChemServiceError";
  }
}

export async function searchMolecule(
  query: string,
  type: "name" | "smiles" | "formula"
): Promise<MoleculeData | null> {
  let url: string;
  switch (type) {
    case "name":
      url = `${PUBCHEM_BASE}/compound/name/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChIKey,XLogP,HBondDonorCount,HBondAcceptorCount,TPSA,RotatableBondCount,Complexity/JSON`;
      break;
    case "smiles":
      url = `${PUBCHEM_BASE}/compound/smiles/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChIKey,XLogP,HBondDonorCount,HBondAcceptorCount,TPSA,RotatableBondCount,Complexity/JSON`;
      break;
    case "formula":
      url = `${PUBCHEM_BASE}/compound/fastformula/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChIKey,XLogP,HBondDonorCount,HBondAcceptorCount,TPSA,RotatableBondCount,Complexity/JSON`;
      break;
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new PubChemServiceError(
      `PubChem konnte nicht erreicht werden: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  // PubChem returns 404 when a compound genuinely does not exist.
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new PubChemServiceError(
      `PubChem antwortete mit Status ${response.status}`,
      response.status
    );
  }

  const data = await response.json();
  const props = data.PropertyTable?.Properties?.[0];
  if (!props) return null;

  const cid = props.CID;
  const ghsData = await fetchGHSData(cid);

  // Fetch compound name (best-effort: a missing display name must not fail the
  // whole lookup, so we fall back to the query and log any failure).
  let name = query;
  if (type !== "name") {
    try {
      const nameRes = await fetch(
        `${PUBCHEM_BASE}/compound/cid/${cid}/description/JSON`
      );
      if (nameRes.ok) {
        const nameData = await nameRes.json();
        name = nameData.InformationList?.Information?.[0]?.Title || query;
      }
    } catch (error) {
      console.warn(`PubChem name lookup failed for CID ${cid}:`, error);
    }
  }

  return {
    cid,
    name,
    molecularFormula: props.MolecularFormula,
    molecularWeight: props.MolecularWeight,
    canonicalSmiles: props.CanonicalSMILES,
    inchiKey: props.InChIKey,
    xlogp: props.XLogP ?? null,
    hbondDonors: props.HBondDonorCount,
    hbondAcceptors: props.HBondAcceptorCount,
    tpsa: props.TPSA ?? null,
    rotatableBonds: props.RotatableBondCount,
    complexity: props.Complexity ?? null,
    ghsClassification: ghsData,
  };
}

async function fetchGHSData(cid: number): Promise<GHSData | null> {
  try {
    const url = `${PUBCHEM_BASE}/compound/cid/${cid}/property/MolecularFormula/JSON`;
    const ghsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`;
    const response = await fetch(ghsUrl);
    if (!response.ok) return null;

    const data = await response.json();
    const sections = data.Record?.Section || [];

    let pictograms: string[] = [];
    let hStatements: string[] = [];
    let pStatements: string[] = [];
    let signalWord: string | null = null;

    function extractInfo(sections: any[]) {
      for (const section of sections) {
        const heading = section.TOCHeading || "";
        if (heading.includes("Pictogram")) {
          const info = section.Information || [];
          for (const item of info) {
            if (item.Value?.StringWithMarkup) {
              for (const s of item.Value.StringWithMarkup) {
                if (s.Markup) {
                  for (const m of s.Markup) {
                    if (m.URL) pictograms.push(m.URL);
                  }
                }
                if (s.String && s.String.startsWith("GHS")) {
                  pictograms.push(s.String);
                }
              }
            }
          }
        }
        if (heading.includes("Signal")) {
          const info = section.Information || [];
          for (const item of info) {
            if (item.Value?.StringWithMarkup?.[0]?.String) {
              signalWord = item.Value.StringWithMarkup[0].String;
            }
          }
        }
        if (heading.includes("Hazard Statement")) {
          const info = section.Information || [];
          for (const item of info) {
            if (item.Value?.StringWithMarkup) {
              for (const s of item.Value.StringWithMarkup) {
                if (s.String) hStatements.push(s.String);
              }
            }
          }
        }
        if (heading.includes("Precautionary Statement")) {
          const info = section.Information || [];
          for (const item of info) {
            if (item.Value?.StringWithMarkup) {
              for (const s of item.Value.StringWithMarkup) {
                if (s.String) pStatements.push(s.String);
              }
            }
          }
        }
        if (section.Section) {
          extractInfo(section.Section);
        }
      }
    }

    extractInfo(sections);

    if (pictograms.length === 0 && hStatements.length === 0) return null;

    return { pictograms, hStatements, pStatements, signalWord };
  } catch (error) {
    // GHS data is supplementary; log but degrade gracefully to null rather
    // than failing the whole molecule lookup.
    console.warn(`PubChem GHS lookup failed for CID ${cid}:`, error);
    return null;
  }
}
