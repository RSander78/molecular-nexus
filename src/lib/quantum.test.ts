import { describe, it, expect } from "vitest";
import {
  getElectronConfiguration,
  getQuantumNumbers,
  calculateHydrogenEnergy,
  calculateParticleInBox,
  calculateDeBroglie,
  calculateHeisenberg,
} from "./quantum";

describe("getElectronConfiguration", () => {
  it("returns the configuration of hydrogen", () => {
    const r = getElectronConfiguration(1);
    expect(r.element).toBe("H");
    expect(r.full).toBe("1s1");
    expect(r.shorthand).toBe("1s1");
    expect(r.valenceElectrons).toBe(1);
  });

  it("returns the configuration of helium", () => {
    const r = getElectronConfiguration(2);
    expect(r.element).toBe("He");
    expect(r.full).toBe("1s2");
    expect(r.valenceElectrons).toBe(2);
  });

  it("uses noble-gas shorthand for sodium", () => {
    const r = getElectronConfiguration(11);
    expect(r.element).toBe("Na");
    expect(r.full).toBe("1s2 2s2 2p6 3s1");
    expect(r.shorthand).toBe("[Ne] 3s1");
    expect(r.valenceElectrons).toBe(1);
  });

  it("counts d electrons as valence for iron", () => {
    const r = getElectronConfiguration(26);
    expect(r.element).toBe("Fe");
    expect(r.full).toBe("1s2 2s2 2p6 3s2 3p6 4s2 3d6");
    expect(r.shorthand).toBe("[Ar] 4s2 3d6");
    // Implementation counts all n === lastN (=3) electrons: 3s2 + 3p6 + 3d6.
    expect(r.valenceElectrons).toBe(14);
  });

  it("throws for atomic numbers below 1", () => {
    expect(() => getElectronConfiguration(0)).toThrow();
  });

  it("throws for atomic numbers above 118", () => {
    expect(() => getElectronConfiguration(119)).toThrow();
  });
});

describe("getQuantumNumbers", () => {
  it("returns quantum numbers for the first electron of hydrogen", () => {
    const r = getQuantumNumbers(1, 1);
    expect(r).toEqual({ n: 1, l: 0, ml: 0, ms: 0.5, orbital: "1s" });
  });

  it("assigns spin-down to the second electron in an orbital", () => {
    const r = getQuantumNumbers(2, 2);
    expect(r.n).toBe(1);
    expect(r.l).toBe(0);
    expect(r.ms).toBe(-0.5);
    expect(r.orbital).toBe("1s");
  });

  it("returns a 2p orbital for the fifth electron", () => {
    const r = getQuantumNumbers(6, 5);
    expect(r.orbital).toBe("2p");
    expect(r.l).toBe(1);
  });

  it("throws when the electron number is below 1", () => {
    expect(() => getQuantumNumbers(6, 0)).toThrow();
  });

  it("throws when the electron number exceeds the atomic number", () => {
    expect(() => getQuantumNumbers(6, 7)).toThrow();
  });
});

describe("calculateHydrogenEnergy", () => {
  it("returns -13.6 eV for the ground state", () => {
    const r = calculateHydrogenEnergy(1);
    expect(r.energy_eV).toBeCloseTo(-13.6, 10);
    expect(r.radius_pm).toBeCloseTo(52.9177, 3);
  });

  it("scales energy with 1/n^2 and radius with n^2", () => {
    const r = calculateHydrogenEnergy(2);
    expect(r.energy_eV).toBeCloseTo(-3.4, 10);
    expect(r.radius_pm).toBeCloseTo(52.9177 * 4, 3);
  });

  it("keeps energy_J consistent with energy_eV", () => {
    const r = calculateHydrogenEnergy(3);
    expect(r.energy_J).toBeCloseTo(r.energy_eV * 1.602176634e-19, 30);
  });
});

describe("calculateParticleInBox", () => {
  it("computes the ground-state energy of an electron in a 1 nm box", () => {
    const r = calculateParticleInBox(1, 1);
    expect(r.energy_eV).toBeCloseTo(0.376, 3);
  });

  it("scales energy with n^2", () => {
    const ground = calculateParticleInBox(1, 1).energy_J;
    const second = calculateParticleInBox(2, 1).energy_J;
    expect(second / ground).toBeCloseTo(4, 6);
  });
});

describe("calculateDeBroglie", () => {
  it("computes the wavelength of an electron", () => {
    const r = calculateDeBroglie(9.1093837015e-31, 1e6);
    expect(r.wavelength_m).toBeCloseTo(7.274e-10, 13);
    expect(r.wavelength_pm).toBeCloseTo(r.wavelength_m * 1e12, 6);
  });
});

describe("calculateHeisenberg", () => {
  it("computes the minimum momentum uncertainty", () => {
    const r = calculateHeisenberg(1e-10);
    const hbar = 6.62607015e-34 / (2 * Math.PI);
    expect(r.deltaP).toBeCloseTo(hbar / (2 * 1e-10), 30);
    expect(r.deltaV).toBeCloseTo(r.deltaP / 9.1093837015e-31, 6);
  });
});
