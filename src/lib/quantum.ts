// Physikalische Konstanten
const h = 6.62607015e-34; // Planck-Konstante (J·s)
const hbar = h / (2 * Math.PI); // Reduzierte Planck-Konstante
const me = 9.1093837015e-31; // Elektronenmasse (kg)
const e = 1.602176634e-19; // Elementarladung (C)
const a0 = 5.29177210903e-11; // Bohr-Radius (m)
const eV = 1.602176634e-19; // 1 eV in Joule

// Elemente-Daten
const ELEMENTS = [
  "", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
  "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
  "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
  "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
  "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
  "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
  "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds",
  "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
];

const NOBLE_GASES: Record<number, string> = {
  2: "[He]", 10: "[Ne]", 18: "[Ar]", 36: "[Kr]", 54: "[Xe]", 86: "[Rn]"
};

// Aufbau-Reihenfolge der Orbitale
const ORBITAL_ORDER = [
  [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0],
  [4, 2], [5, 1], [6, 0], [4, 3], [5, 2], [6, 1], [7, 0], [5, 3], [6, 2],
  [7, 1], [6, 3]
];

const SUBSHELL_NAMES = ["s", "p", "d", "f"];

export function getElectronConfiguration(atomicNumber: number): {
  full: string;
  shorthand: string;
  valenceElectrons: number;
  element: string;
} {
  if (atomicNumber < 1 || atomicNumber > 118) {
    throw new Error("Ordnungszahl muss zwischen 1 und 118 liegen");
  }

  const config: { n: number; l: number; electrons: number }[] = [];
  let remaining = atomicNumber;

  for (const [n, l] of ORBITAL_ORDER) {
    if (remaining <= 0) break;
    const maxElectrons = 2 * (2 * l + 1);
    const electrons = Math.min(remaining, maxElectrons);
    config.push({ n, l, electrons });
    remaining -= electrons;
  }

  const full = config
    .map((c) => `${c.n}${SUBSHELL_NAMES[c.l]}${c.electrons}`)
    .join(" ");

  // Kurzschreibweise
  let shorthand = full;
  let lastNobleGas = 0;
  for (const [z, symbol] of Object.entries(NOBLE_GASES)) {
    if (parseInt(z) < atomicNumber) {
      lastNobleGas = parseInt(z);
    }
  }
  if (lastNobleGas > 0) {
    let coreElectrons = 0;
    let coreConfig: string[] = [];
    for (const c of config) {
      const str = `${c.n}${SUBSHELL_NAMES[c.l]}${c.electrons}`;
      coreElectrons += c.electrons;
      coreConfig.push(str);
      if (coreElectrons === lastNobleGas) break;
    }
    const valenceConfig = full.replace(coreConfig.join(" "), "").trim();
    shorthand = `${NOBLE_GASES[lastNobleGas]} ${valenceConfig}`.trim();
  }

  // Valenzelektronen (vereinfacht: letzte Schale)
  const lastN = config[config.length - 1]?.n || 1;
  const valenceElectrons = config
    .filter((c) => c.n === lastN || (c.n === lastN - 1 && c.l >= 2))
    .reduce((sum, c) => sum + c.electrons, 0);

  return {
    full,
    shorthand,
    valenceElectrons,
    element: ELEMENTS[atomicNumber] || `Element ${atomicNumber}`,
  };
}

export function getQuantumNumbers(
  atomicNumber: number,
  electronNumber: number
): { n: number; l: number; ml: number; ms: number; orbital: string } {
  if (electronNumber < 1 || electronNumber > atomicNumber) {
    throw new Error("Ungültige Elektronennummer");
  }

  let count = 0;
  for (const [n, l] of ORBITAL_ORDER) {
    const maxElectrons = 2 * (2 * l + 1);
    if (count + maxElectrons >= electronNumber) {
      const posInSubshell = electronNumber - count - 1;
      const numOrbitals = 2 * l + 1;
      const orbitalIndex = posInSubshell % numOrbitals;
      const ml = -l + orbitalIndex;
      const ms = posInSubshell < numOrbitals ? 0.5 : -0.5;
      return {
        n,
        l,
        ml,
        ms,
        orbital: `${n}${SUBSHELL_NAMES[l]}`,
      };
    }
    count += maxElectrons;
  }

  throw new Error("Konnte Quantenzahlen nicht berechnen");
}

export function calculateHydrogenEnergy(n: number): {
  energy_eV: number;
  energy_J: number;
  radius_pm: number;
} {
  const energy_eV = -13.6 / (n * n);
  const energy_J = energy_eV * eV;
  const radius_pm = (a0 * n * n * 1e12);
  return { energy_eV, energy_J, radius_pm };
}

export function calculateParticleInBox(
  n: number,
  length_nm: number,
  mass_kg: number = me
): { energy_eV: number; energy_J: number } {
  const L = length_nm * 1e-9;
  const energy_J = (n * n * h * h) / (8 * mass_kg * L * L);
  const energy_eV = energy_J / eV;
  return { energy_eV, energy_J };
}

export function calculateDeBroglie(
  mass_kg: number,
  velocity_ms: number
): { wavelength_m: number; wavelength_pm: number } {
  const wavelength_m = h / (mass_kg * velocity_ms);
  return { wavelength_m, wavelength_pm: wavelength_m * 1e12 };
}

export function calculateHeisenberg(
  deltaX_m: number
): { deltaP: number; deltaV: number } {
  const deltaP = hbar / (2 * deltaX_m);
  const deltaV = deltaP / me;
  return { deltaP, deltaV };
}
