import type { Scenario } from "../engine/types";
import { wifiBasic } from "./wifi-basic";

// Add more scenarios here if needed:
const catalog: Record<string, Scenario> = {
  [wifiBasic.id]: wifiBasic,
};

export const scenarioById = (id: string): Scenario => catalog[id];
export const scenarioList = Object.values(catalog).map((s) => ({ id: s.id, name: s.name }));
export const defaultScenarioId = wifiBasic.id;
