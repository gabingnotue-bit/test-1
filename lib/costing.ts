export type MarginMode = "percent" | "multiplier" | "fixed";

export type CostInputs = {
  totalCutAreaCm2: number;
  fabricPricePerM: number;
  fabricWidthCm: number;
  markerEfficiency: number;
  wastePct: number;
  matchExtraPct: number;
  notions: number;
  lining: number;
  fusible: number;
  laborMinutes: number;
  laborCostPerMinute: number;
  overheadMode: "percent" | "fixed";
  overheadValue: number;
  packaging: number;
  transport: number;
  marginMode: MarginMode;
  marginValue: number;
};

function applyMargin(total: number, mode: MarginMode, value: number) {
  if (mode === "percent") return total * (1 + value / 100);
  if (mode === "multiplier") return total * value;
  return total + value;
}

function scenario(base: CostInputs, factor: number) {
  const areaM2 = (base.totalCutAreaCm2 * factor) / 10000;
  const widthM = base.fabricWidthCm / 100;
  const efficiency = Math.max(base.markerEfficiency / 100, 0.01);
  const waste = base.wastePct / 100;
  const matchExtra = base.matchExtraPct / 100;

  const fabricMeters = (areaM2 / widthM / efficiency) * (1 + waste + matchExtra);
  const fabricCost = fabricMeters * base.fabricPricePerM;
  const materials = fabricCost + base.notions + base.lining + base.fusible;
  const labor = base.laborMinutes * base.laborCostPerMinute * factor;
  const overhead =
    base.overheadMode === "percent"
      ? ((materials + labor) * base.overheadValue) / 100
      : base.overheadValue;

  const total = materials + labor + overhead + base.packaging + base.transport;
  const priceHT = applyMargin(total, base.marginMode, base.marginValue);
  const priceTTC = priceHT * 1.19;

  return { fabricMeters, materials, labor, overhead, total, priceHT, priceTTC, priceTTCRounded: Math.round(priceTTC) };
}

export function computeCost(input: CostInputs) {
  return {
    min: scenario(input, 0.9),
    probable: scenario(input, 1),
    max: scenario(input, 1.15),
  };
}
