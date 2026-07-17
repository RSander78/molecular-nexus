// Periodensystem-Daten
const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.81, C: 12.011,
  N: 14.007, O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305,
  Al: 26.982, Si: 28.086, P: 30.974, S: 32.065, Cl: 35.453, Ar: 39.948,
  K: 39.098, Ca: 40.078, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938,
  Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723,
  Ge: 72.63, As: 74.922, Se: 78.96, Br: 79.904, Kr: 83.798, Rb: 85.468,
  Sr: 87.62, Zr: 91.224, Mo: 95.96, Ag: 107.868, Sn: 118.710, I: 126.904,
  Ba: 137.327, W: 183.84, Pt: 195.084, Au: 196.967, Hg: 200.59, Pb: 207.2,
  U: 238.029,
};

export function parseFormula(formula: string): Record<string, number> {
  const elements: Record<string, number> = {};
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    if (match[1]) {
      const element = match[1];
      const count = match[2] ? parseInt(match[2]) : 1;
      elements[element] = (elements[element] || 0) + count;
    }
  }
  return elements;
}

export function calculateMolarMass(formula: string): {
  molarMass: number;
  composition: { element: string; mass: number; percentage: number }[];
} | null {
  const elements = parseFormula(formula);
  if (Object.keys(elements).length === 0) return null;

  let totalMass = 0;
  const composition: { element: string; mass: number; percentage: number }[] = [];

  for (const [element, count] of Object.entries(elements)) {
    const weight = ATOMIC_WEIGHTS[element];
    if (!weight) return null;
    const mass = weight * count;
    totalMass += mass;
    composition.push({ element, mass, percentage: 0 });
  }

  for (const comp of composition) {
    comp.percentage = (comp.mass / totalMass) * 100;
  }

  return { molarMass: totalMass, composition };
}

export function calculateConcentration(
  moles: number,
  volumeLiters: number
): { molarity: number } {
  return { molarity: moles / volumeLiters };
}

export function calculatePH(
  concentration: number,
  type: "strong_acid" | "strong_base" | "weak_acid" | "weak_base",
  ka?: number
): { ph: number; poh: number; h3o: number; oh: number } {
  let h3o: number;

  switch (type) {
    case "strong_acid":
      h3o = concentration;
      break;
    case "strong_base":
      h3o = 1e-14 / concentration;
      break;
    case "weak_acid":
      h3o = Math.sqrt((ka || 1e-5) * concentration);
      break;
    case "weak_base":
      const oh_base = Math.sqrt((ka || 1e-5) * concentration);
      h3o = 1e-14 / oh_base;
      break;
    default:
      h3o = concentration;
  }

  const ph = -Math.log10(h3o);
  const poh = 14 - ph;
  const oh = 1e-14 / h3o;

  return { ph, poh, h3o, oh };
}

export function calculateStoichiometry(
  reactantMass: number,
  reactantMolarMass: number,
  productMolarMass: number,
  coeffReactant: number,
  coeffProduct: number
): { productMass: number; molesReactant: number; molesProduct: number } {
  const molesReactant = reactantMass / reactantMolarMass;
  const molesProduct = molesReactant * (coeffProduct / coeffReactant);
  const productMass = molesProduct * productMolarMass;
  return { productMass, molesReactant, molesProduct };
}

export function calculateDilution(
  c1: number | null,
  v1: number | null,
  c2: number | null,
  v2: number | null
): { result: number; label: string } {
  if (v1 === null && c1 && c2 && v2) {
    return { result: (c2 * v2) / c1, label: "V₁" };
  }
  if (v2 === null && c1 && v1 && c2) {
    return { result: (c1 * v1) / c2, label: "V₂" };
  }
  if (c2 === null && c1 && v1 && v2) {
    return { result: (c1 * v1) / v2, label: "c₂" };
  }
  return { result: 0, label: "Fehler" };
}
