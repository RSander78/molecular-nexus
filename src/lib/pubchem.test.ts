import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchMolecule } from "./pubchem";

type FetchResponse = {
  ok: boolean;
  json?: () => Promise<unknown>;
};

function jsonResponse(body: unknown, ok = true): FetchResponse {
  return { ok, json: async () => body };
}

const PROPERTY_BODY = {
  PropertyTable: {
    Properties: [
      {
        CID: 962,
        MolecularFormula: "H2O",
        MolecularWeight: "18.015",
        CanonicalSMILES: "O",
        InChIKey: "XLYOFNOQVPJJNP-UHFFFAOYSA-N",
        XLogP: -0.5,
        HBondDonorCount: 1,
        HBondAcceptorCount: 1,
        TPSA: 1.0,
        RotatableBondCount: 0,
        Complexity: 0,
      },
    ],
  },
};

const GHS_BODY = {
  Record: {
    Section: [
      {
        TOCHeading: "Safety",
        Section: [
          {
            TOCHeading: "GHS Classification",
            Section: [
              {
                TOCHeading: "Pictogram(s)",
                Information: [
                  {
                    Value: {
                      StringWithMarkup: [
                        {
                          Markup: [{ URL: "https://example.com/flame.svg" }],
                          String: "GHS02",
                        },
                      ],
                    },
                  },
                ],
              },
              {
                TOCHeading: "Signal",
                Information: [
                  { Value: { StringWithMarkup: [{ String: "Danger" }] } },
                ],
              },
              {
                TOCHeading: "GHS Hazard Statements",
                Information: [
                  {
                    Value: {
                      StringWithMarkup: [{ String: "H225: Highly flammable" }],
                    },
                  },
                ],
              },
              {
                TOCHeading: "Precautionary Statement Codes",
                Information: [
                  {
                    Value: { StringWithMarkup: [{ String: "P210" }] },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

const DESCRIPTION_BODY = {
  InformationList: { Information: [{ Title: "Water" }] },
};

function mockFetch(handler: (url: string) => FetchResponse) {
  const fn = vi.fn(async (url: string) => handler(url) as unknown as Response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("searchMolecule", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns parsed molecule data with GHS classification for a name search", async () => {
    mockFetch((url) => {
      if (url.includes("GHS+Classification")) return jsonResponse(GHS_BODY);
      if (url.includes("/property/")) return jsonResponse(PROPERTY_BODY);
      return jsonResponse({}, false);
    });

    const result = await searchMolecule("water", "name");

    expect(result).not.toBeNull();
    expect(result!.cid).toBe(962);
    expect(result!.name).toBe("water");
    expect(result!.molecularFormula).toBe("H2O");
    expect(result!.hbondDonors).toBe(1);
    expect(result!.ghsClassification).toEqual({
      pictograms: ["https://example.com/flame.svg", "GHS02"],
      hStatements: ["H225: Highly flammable"],
      pStatements: ["P210"],
      signalWord: "Danger",
    });
  });

  it("fetches the compound title for non-name searches", async () => {
    const fetchFn = mockFetch((url) => {
      if (url.includes("GHS+Classification")) return jsonResponse(GHS_BODY);
      if (url.includes("/description/")) return jsonResponse(DESCRIPTION_BODY);
      if (url.includes("/property/")) return jsonResponse(PROPERTY_BODY);
      return jsonResponse({}, false);
    });

    const result = await searchMolecule("O", "smiles");

    expect(result!.name).toBe("Water");
    expect(fetchFn.mock.calls.some(([u]) => String(u).includes("/smiles/"))).toBe(
      true
    );
  });

  it("returns null when the property lookup fails", async () => {
    mockFetch(() => jsonResponse({}, false));
    expect(await searchMolecule("nonsense", "name")).toBeNull();
  });

  it("returns null when no properties are present", async () => {
    mockFetch((url) => {
      if (url.includes("/property/"))
        return jsonResponse({ PropertyTable: { Properties: [] } });
      return jsonResponse({}, false);
    });
    expect(await searchMolecule("empty", "name")).toBeNull();
  });

  it("leaves GHS classification null when none is available", async () => {
    mockFetch((url) => {
      if (url.includes("GHS+Classification"))
        return jsonResponse({ Record: { Section: [] } });
      if (url.includes("/property/")) return jsonResponse(PROPERTY_BODY);
      return jsonResponse({}, false);
    });

    const result = await searchMolecule("water", "name");
    expect(result!.ghsClassification).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );
    expect(await searchMolecule("water", "name")).toBeNull();
  });
});
