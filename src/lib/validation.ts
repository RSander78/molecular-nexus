import { z } from "zod";

// Shared limits to bound request size and prevent resource exhaustion /
// abuse of the downstream AI provider.
export const MAX_CHAT_MESSAGES = 50;
export const MAX_MESSAGE_LENGTH = 8000;
export const MAX_QUERY_LENGTH = 200;
export const MAX_SMILES_LENGTH = 500;
export const MAX_MOLECULE_LENGTH = 200;

const finiteNumber = z.number().finite();

// --- /api/chat ---
export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1)
    .max(MAX_CHAT_MESSAGES),
});

// --- /api/molecules ---
export const moleculesSchema = z.object({
  query: z.string().min(1).max(MAX_QUERY_LENGTH),
  type: z.enum(["name", "smiles", "formula"]),
});

// --- /api/predictions ---
export const predictionsSchema = z.object({
  smiles: z.string().min(1).max(MAX_SMILES_LENGTH),
  type: z.enum(["admet", "reaction", "qsar"]),
});

// --- /api/calculations ---
export const calculationsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("molar_mass"),
    params: z.object({ formula: z.string().min(1).max(200) }),
  }),
  z.object({
    type: z.literal("concentration"),
    params: z.object({ moles: finiteNumber, volume: finiteNumber }),
  }),
  z.object({
    type: z.literal("ph"),
    params: z.object({
      concentration: finiteNumber,
      acidBaseType: z.enum([
        "strong_acid",
        "strong_base",
        "weak_acid",
        "weak_base",
      ]),
      ka: finiteNumber.optional(),
    }),
  }),
  z.object({
    type: z.literal("stoichiometry"),
    params: z.object({
      reactantMass: finiteNumber,
      reactantMolarMass: finiteNumber,
      productMolarMass: finiteNumber,
      coeffReactant: finiteNumber,
      coeffProduct: finiteNumber,
    }),
  }),
  z.object({
    type: z.literal("dilution"),
    params: z.object({
      c1: finiteNumber.nullable(),
      v1: finiteNumber.nullable(),
      c2: finiteNumber.nullable(),
      v2: finiteNumber.nullable(),
    }),
  }),
]);

// --- /api/quantum ---
export const quantumSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("electron_config"),
    params: z.object({ atomicNumber: z.number().int().min(1).max(118) }),
  }),
  z.object({
    type: z.literal("quantum_numbers"),
    params: z.object({
      atomicNumber: z.number().int().min(1).max(118),
      electronNumber: z.number().int().min(1).max(118),
    }),
  }),
  z.object({
    type: z.literal("hydrogen_energy"),
    params: z.object({ n: z.number().int().min(1).max(1000) }),
  }),
  z.object({
    type: z.literal("particle_in_box"),
    params: z.object({
      n: z.number().int().min(1).max(1000),
      length: finiteNumber.positive(),
      mass: finiteNumber.positive().optional(),
    }),
  }),
  z.object({
    type: z.literal("de_broglie"),
    params: z.object({
      mass: finiteNumber.positive(),
      velocity: finiteNumber,
    }),
  }),
  z.object({
    type: z.literal("heisenberg"),
    params: z.object({ deltaX: finiteNumber.positive() }),
  }),
  z.object({
    type: z.literal("mo_analysis"),
    params: z.object({ molecule: z.string().min(1).max(MAX_MOLECULE_LENGTH) }),
  }),
  z.object({
    type: z.literal("spectroscopy"),
    params: z.object({ smiles: z.string().min(1).max(MAX_SMILES_LENGTH) }),
  }),
]);

// Parses and validates a JSON request body against a schema.
// Returns a discriminated result so callers can respond with 400 on failure.
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false, error: "Ungültiger JSON-Body" };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false, error: "Ungültige Eingabe" };
  }
  return { success: true, data: result.data };
}
