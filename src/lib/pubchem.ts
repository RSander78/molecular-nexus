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

export async function searchMolecule(
  query: string,
  type: "name" | "smiles" | "formula"
): Promise<MoleculeData | null> {
  try {
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

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const props = data.PropertyTable?.Properties?.[0];
    if (!props) return null;

    const cid = props.CID;
    const ghsData = await fetchGHSData(cid);

    // Fetch compound name
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
      } catch {}
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
  } catch (error) {
    console.error("PubChem search error:", error);
    return null;
  }
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
  } catch {
    return null;
  }
}
