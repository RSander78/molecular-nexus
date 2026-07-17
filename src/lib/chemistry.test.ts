import { describe, it, expect } from "vitest";
import {
  parseFormula,
  calculateMolarMass,
  calculateConcentration,
  calculatePH,
  calculateStoichiometry,
  calculateDilution,
} from "./chemistry";

describe("parseFormula", () => {
  it("parses a simple formula with explicit counts", () => {
    expect(parseFormula("H2O")).toEqual({ H: 2, O: 1 });
  });

  it("treats missing subscripts as one", () => {
    expect(parseFormula("NaCl")).toEqual({ Na: 1, Cl: 1 });
  });

  it("parses multi-element formulas", () => {
    expect(parseFormula("C6H12O6")).toEqual({ C: 6, H: 12, O: 6 });
  });

  it("accumulates repeated elements", () => {
    expect(parseFormula("CH3COOH")).toEqual({ C: 2, H: 4, O: 2 });
  });

  it("returns an empty object for an empty string", () => {
    expect(parseFormula("")).toEqual({});
  });
});

describe("calculateMolarMass", () => {
  it("computes the molar mass of water", () => {
    const result = calculateMolarMass("H2O");
    expect(result).not.toBeNull();
    expect(result!.molarMass).toBeCloseTo(18.015, 3);
  });

  it("computes composition percentages that sum to 100", () => {
    const result = calculateMolarMass("H2O")!;
    const total = result.composition.reduce((s, c) => s + c.percentage, 0);
    expect(total).toBeCloseTo(100, 6);
    const oxygen = result.composition.find((c) => c.element === "O")!;
    expect(oxygen.mass).toBeCloseTo(15.999, 3);
    expect(oxygen.percentage).toBeCloseTo((15.999 / 18.015) * 100, 3);
  });

  it("returns null for an empty formula", () => {
    expect(calculateMolarMass("")).toBeNull();
  });

  it("returns null when an element is unknown", () => {
    expect(calculateMolarMass("Xx2")).toBeNull();
  });
});

describe("calculateConcentration", () => {
  it("computes molarity from moles and volume", () => {
    expect(calculateConcentration(0.5, 2).molarity).toBeCloseTo(0.25, 10);
  });
});

describe("calculatePH", () => {
  it("computes pH for a strong acid", () => {
    const r = calculatePH(0.01, "strong_acid");
    expect(r.ph).toBeCloseTo(2, 10);
    expect(r.poh).toBeCloseTo(12, 10);
    expect(r.h3o).toBeCloseTo(0.01, 10);
    expect(r.oh).toBeCloseTo(1e-12, 20);
  });

  it("computes pH for a strong base", () => {
    const r = calculatePH(0.01, "strong_base");
    expect(r.ph).toBeCloseTo(12, 10);
    expect(r.poh).toBeCloseTo(2, 10);
  });

  it("computes pH for a weak acid with a given Ka", () => {
    const r = calculatePH(0.1, "weak_acid", 1.8e-5);
    const expectedH3o = Math.sqrt(1.8e-5 * 0.1);
    expect(r.h3o).toBeCloseTo(expectedH3o, 10);
    expect(r.ph).toBeCloseTo(-Math.log10(expectedH3o), 10);
  });

  it("uses a default Ka for weak acids when none is provided", () => {
    const r = calculatePH(0.1, "weak_acid");
    expect(r.h3o).toBeCloseTo(Math.sqrt(1e-5 * 0.1), 10);
  });

  it("computes pH for a weak base", () => {
    const r = calculatePH(0.1, "weak_base", 1.8e-5);
    const ohBase = Math.sqrt(1.8e-5 * 0.1);
    expect(r.h3o).toBeCloseTo(1e-14 / ohBase, 20);
  });
});

describe("calculateStoichiometry", () => {
  it("computes product mass and moles", () => {
    const r = calculateStoichiometry(10, 100, 200, 1, 2);
    expect(r.molesReactant).toBeCloseTo(0.1, 10);
    expect(r.molesProduct).toBeCloseTo(0.2, 10);
    expect(r.productMass).toBeCloseTo(40, 10);
  });
});

describe("calculateDilution", () => {
  it("solves for V1 when v1 is null", () => {
    const r = calculateDilution(2, null, 0.5, 100);
    expect(r.label).toBe("V₁");
    expect(r.result).toBeCloseTo((0.5 * 100) / 2, 10);
  });

  it("solves for V2 when v2 is null", () => {
    const r = calculateDilution(2, 50, 0.5, null);
    expect(r.label).toBe("V₂");
    expect(r.result).toBeCloseTo((2 * 50) / 0.5, 10);
  });

  it("solves for c2 when c2 is null", () => {
    const r = calculateDilution(2, 50, null as unknown as number, 200);
    expect(r.label).toBe("c₂");
    expect(r.result).toBeCloseTo((2 * 50) / 200, 10);
  });

  it("returns an error result when the inputs are underdetermined", () => {
    const r = calculateDilution(0, null, 0, null);
    expect(r.label).toBe("Fehler");
    expect(r.result).toBe(0);
  });
});
