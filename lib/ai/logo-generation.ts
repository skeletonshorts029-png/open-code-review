import { BrandingData, LogoConceptRecord, ProblemRecord } from "@/lib/types";

interface GenerateLogoConceptsInput {
  problem: ProblemRecord;
  branding: BrandingData;
  selectedName: string;
  generationNonce?: string;
}

const FALLBACK_VARIANTS = [
  {
    title: "Signal Monogram",
    subtitle: "Premium software-led identity",
    rationale:
      "A sharp monogram direction for a startup that needs to feel fast, intelligent, and credible on product surfaces.",
  },
  {
    title: "Orbit Network",
    subtitle: "System coordination emblem",
    rationale:
      "An emblem built around connected motion and coordinated operations, useful when the brand solves fragmented workflows.",
  },
  {
    title: "Flow Mark",
    subtitle: "Operational clarity symbol",
    rationale:
      "A fluid direction focused on movement, continuity, and execution clarity for service-heavy or workflow-heavy businesses.",
  },
  {
    title: "Trust Crest",
    subtitle: "High-confidence market signal",
    rationale:
      "A more structured category-leader mark for buyers who care about trust, authority, and reliable execution.",
  },
] as const;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || `logo-${Date.now()}`;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function extractSvg(value: unknown) {
  const raw = asString(value);
  const start = raw.indexOf("<svg");
  const end = raw.lastIndexOf("</svg>");
  if (start === -1 || end === -1) return "";

  const svg = raw.slice(start, end + 6).trim();
  const blockedPatterns = [
    /<script/gi,
    /<style/gi,
    /<foreignObject/gi,
    /<image/gi,
    /href\s*=/gi,
    /xlink:href\s*=/gi,
    /\son[a-z]+\s*=/gi,
  ];

  if (blockedPatterns.some((pattern) => pattern.test(svg))) {
    return "";
  }

  return svg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .trim();
}

function fallbackLogoSvg(
  name: string,
  colors: string[],
  badge: string,
  variantIndex: number,
  generationNonce?: string
) {
  const palette = [
    colors[0] || "#050816",
    colors[1] || "#10172a",
    colors[2] || "#7c3aed",
    colors[3] || "#38bdf8",
    colors[4] || "#e2e8f0",
  ];
  const mark = (name.match(/[A-Za-z0-9]/g) || ["B", "N"]).slice(0, 2).join("").toUpperCase();
  const rand = mulberry32(hashString(`${name}:${badge}:${variantIndex}:${generationNonce || "static"}`));
  const rectX = 18 + rand() * 24;
  const rectY = 18 + rand() * 20;
  const rectSize = 70 + rand() * 18;
  const rectRadius = 18 + rand() * 18;
  const circleX = 148 + rand() * 40;
  const circleY = 38 + rand() * 52;
  const circleRadius = 14 + rand() * 18;
  const pathStartY = 94 + rand() * 18;
  const pathControl1Y = 34 + rand() * 36;
  const pathControl2Y = 92 + rand() * 24;
  const pathEndY = 44 + rand() * 34;
  const gradientId = `brand-gradient-${variantIndex}-${Math.round(rand() * 10000)}`;
  const commonDefs = [
    "<defs>",
    `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `<stop offset="0%" stop-color="${palette[2]}"/>`,
    `<stop offset="100%" stop-color="${palette[3]}"/>`,
    "</linearGradient>",
    "</defs>",
  ];

  if (variantIndex === 1) {
    return [
      `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} logo">`,
      ...commonDefs,
      `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[0]}"/>`,
      `<rect x="${rectX.toFixed(1)}" y="${rectY.toFixed(1)}" width="${rectSize.toFixed(1)}" height="${rectSize.toFixed(1)}" rx="${rectRadius.toFixed(1)}" fill="url(#${gradientId})" opacity="0.96"/>`,
      `<circle cx="${circleX.toFixed(1)}" cy="${circleY.toFixed(1)}" r="${circleRadius.toFixed(1)}" fill="${palette[3]}" opacity="0.16"/>`,
      `<path d="M42 ${pathStartY.toFixed(1)} C 82 ${pathControl1Y.toFixed(1)}, 90 ${pathControl2Y.toFixed(1)}, 146 ${pathEndY.toFixed(1)}" stroke="rgba(255,255,255,0.2)" stroke-width="3" fill="none"/>`,
      `<text x="${(rectX + rectSize / 2).toFixed(1)}" y="${(rectY + rectSize / 2 + 10).toFixed(1)}" text-anchor="middle" fill="#ffffff" font-size="30" font-weight="800" font-family="Arial, Helvetica, sans-serif">${mark}</text>`,
      `<text x="132" y="72" fill="${palette[4]}" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">${name}</text>`,
      `<text x="132" y="98" fill="#94a3b8" font-size="10" letter-spacing="2" font-family="Arial, Helvetica, sans-serif">${badge}</text>`,
      "</svg>",
    ].join("");
  }

  if (variantIndex === 2) {
    const coreX = 74 + rand() * 10;
    const coreY = 80;
    const orbitR = 34 + rand() * 12;
    const nodeAngle = rand() * Math.PI * 2;
    const nodeX = coreX + Math.cos(nodeAngle) * (orbitR + 12);
    const nodeY = coreY + Math.sin(nodeAngle) * (orbitR + 12);
    return [
      `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} logo">`,
      ...commonDefs,
      `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[1]}"/>`,
      `<circle cx="${coreX.toFixed(1)}" cy="${coreY}" r="${(24 + rand() * 8).toFixed(1)}" fill="${palette[0]}" stroke="${palette[3]}" stroke-width="2.5"/>`,
      `<circle cx="${coreX.toFixed(1)}" cy="${coreY}" r="${orbitR.toFixed(1)}" fill="none" stroke="url(#${gradientId})" stroke-width="4" stroke-dasharray="${10 + Math.round(rand() * 6)} ${12 + Math.round(rand() * 6)}"/>`,
      `<ellipse cx="${coreX.toFixed(1)}" cy="${coreY}" rx="${(orbitR + 14).toFixed(1)}" ry="${(18 + rand() * 12).toFixed(1)}" fill="none" stroke="${palette[2]}" stroke-width="2" opacity="0.42"/>`,
      `<circle cx="${nodeX.toFixed(1)}" cy="${nodeY.toFixed(1)}" r="${(6 + rand() * 4).toFixed(1)}" fill="${palette[3]}"/>`,
      `<text x="${coreX.toFixed(1)}" y="${coreY + 10}" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="800" font-family="Arial, Helvetica, sans-serif">${mark}</text>`,
      `<text x="132" y="70" fill="${palette[4]}" font-size="21" font-weight="700" font-family="Arial, Helvetica, sans-serif">${name}</text>`,
      `<text x="132" y="97" fill="#94a3b8" font-size="11" letter-spacing="1.6" font-family="Arial, Helvetica, sans-serif">${badge}</text>`,
      "</svg>",
    ].join("");
  }

  if (variantIndex === 3) {
    const startX = 26 + rand() * 10;
    const endX = 116 + rand() * 14;
    const y1 = 48 + rand() * 12;
    const y2 = 82 + rand() * 8;
    const y3 = 114 - rand() * 10;
    return [
      `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} logo">`,
      ...commonDefs,
      `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[0]}"/>`,
      `<path d="M${startX.toFixed(1)} ${y1.toFixed(1)} C 58 ${(y1 - 18).toFixed(1)}, 86 ${(y1 - 18 + rand() * 14).toFixed(1)}, ${endX.toFixed(1)} ${(y1 + 6).toFixed(1)}" fill="none" stroke="url(#${gradientId})" stroke-width="14" stroke-linecap="round"/>`,
      `<path d="M${startX.toFixed(1)} ${y2.toFixed(1)} C 60 ${(y2 + 18).toFixed(1)}, 88 ${(y2 + 18 - rand() * 12).toFixed(1)}, ${endX.toFixed(1)} ${(y2 - 4).toFixed(1)}" fill="none" stroke="${palette[3]}" stroke-width="12" stroke-linecap="round" opacity="0.82"/>`,
      `<path d="M${startX.toFixed(1)} ${y3.toFixed(1)} C 60 ${(y3 - 18).toFixed(1)}, 88 ${(y3 - 10 + rand() * 14).toFixed(1)}, ${endX.toFixed(1)} ${(y3 + 4).toFixed(1)}" fill="none" stroke="${palette[2]}" stroke-width="10" stroke-linecap="round" opacity="0.68"/>`,
      `<circle cx="${(endX + 10).toFixed(1)}" cy="${(y1 + 6).toFixed(1)}" r="${(5 + rand() * 3).toFixed(1)}" fill="${palette[4]}"/>`,
      `<text x="134" y="70" fill="${palette[4]}" font-size="21" font-weight="700" font-family="Arial, Helvetica, sans-serif">${name}</text>`,
      `<text x="134" y="98" fill="#94a3b8" font-size="11" letter-spacing="1.6" font-family="Arial, Helvetica, sans-serif">${badge}</text>`,
      "</svg>",
    ].join("");
  }

  const outerLeft = 28 + rand() * 14;
  const outerTop = 24 + rand() * 10;
  const outerRight = 118 + rand() * 10;
  const outerBottom = 132 - rand() * 10;
  const innerLeft = outerLeft + 14 + rand() * 8;
  const innerTop = outerTop + 16 + rand() * 8;
  const innerRight = outerRight - 14 - rand() * 8;
  const innerBottom = outerBottom - 14 - rand() * 8;
  return [
    `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} logo">`,
    ...commonDefs,
    `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[1]}"/>`,
    `<path d="M${outerLeft.toFixed(1)} ${outerTop.toFixed(1)} L${outerRight.toFixed(1)} ${(42 + rand() * 12).toFixed(1)} L${outerRight.toFixed(1)} ${(92 + rand() * 8).toFixed(1)} C${outerRight.toFixed(1)} ${(114 + rand() * 8).toFixed(1)} ${(92 + rand() * 8).toFixed(1)} ${(126 + rand() * 6).toFixed(1)} 72 ${outerBottom.toFixed(1)} C${(52 + rand() * 8).toFixed(1)} ${(126 + rand() * 6).toFixed(1)} ${outerLeft.toFixed(1)} ${(114 + rand() * 8).toFixed(1)} ${outerLeft.toFixed(1)} ${(92 + rand() * 8).toFixed(1)} L${outerLeft.toFixed(1)} ${(42 + rand() * 12).toFixed(1)} Z" fill="url(#${gradientId})"/>`,
    `<path d="M${innerLeft.toFixed(1)} ${innerTop.toFixed(1)} L${innerRight.toFixed(1)} ${(58 + rand() * 8).toFixed(1)} L${innerRight.toFixed(1)} ${(86 + rand() * 6).toFixed(1)} C${innerRight.toFixed(1)} ${(98 + rand() * 8).toFixed(1)} ${(88 + rand() * 6).toFixed(1)} ${(108 + rand() * 4).toFixed(1)} 72 ${innerBottom.toFixed(1)} C${(56 + rand() * 6).toFixed(1)} ${(108 + rand() * 4).toFixed(1)} ${innerLeft.toFixed(1)} ${(98 + rand() * 8).toFixed(1)} ${innerLeft.toFixed(1)} ${(86 + rand() * 6).toFixed(1)} L${innerLeft.toFixed(1)} ${(58 + rand() * 8).toFixed(1)} Z" fill="${palette[0]}" opacity="0.25"/>`,
    `<text x="72" y="90" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="800" font-family="Arial, Helvetica, sans-serif">${mark}</text>`,
    `<text x="136" y="72" fill="${palette[4]}" font-size="21" font-weight="700" font-family="Arial, Helvetica, sans-serif">${name}</text>`,
    `<text x="136" y="98" fill="#94a3b8" font-size="11" letter-spacing="1.6" font-family="Arial, Helvetica, sans-serif">${badge}</text>`,
    "</svg>",
  ].join("");
}

function normalizeConcept(
  raw: Record<string, unknown>,
  index: number,
  input: GenerateLogoConceptsInput
): LogoConceptRecord {
  const title = asString(raw.title, `AI Concept ${index + 1}`);
  const subtitle = asString(raw.subtitle, "AI generated brand mark");
  const rationale = asString(
    raw.rationale,
    `This concept translates the ${input.problem.sector.toLowerCase()} problem into a sharper visual identity for ${input.selectedName}.`
  );
  const generationPrompt = asString(
    raw.generationPrompt,
    `${input.selectedName} premium startup logo for ${input.problem.title} in ${input.problem.sector}, dark SaaS aesthetic, clean icon system, scalable mark.`
  );
  const badge = `${input.problem.opportunityTag.toUpperCase()} SYSTEM`;
  const svgMarkup = extractSvg(raw.svgMarkup || raw.svg || raw.markup) ||
    fallbackLogoSvg(input.selectedName, input.branding.colorPalette, badge, index + 1, input.generationNonce);

  return {
    id: slugify(`${input.selectedName}-${title}-${index + 1}`),
    title,
    subtitle,
    rationale,
    generationPrompt,
    svgMarkup,
  };
}

export function createFallbackLogoConcepts(input: GenerateLogoConceptsInput): LogoConceptRecord[] {
  return FALLBACK_VARIANTS.map((variant, index) => ({
    id: slugify(`${input.selectedName}-${variant.title}-${input.generationNonce || index + 1}`),
    title: variant.title,
    subtitle: variant.subtitle,
    rationale: `${variant.rationale} It is tuned to the ${input.problem.sector.toLowerCase()} context and the problem "${input.problem.title}".`,
    generationPrompt: `${input.selectedName} logo in the ${variant.title} direction for a ${input.problem.sector} startup solving ${input.problem.title}. Use ${input.branding.colorPalette.join(", ")} and a premium dark SaaS visual system.`,
    svgMarkup: fallbackLogoSvg(
      input.selectedName,
      input.branding.colorPalette,
      `${input.problem.opportunityTag.toUpperCase()} SYSTEM`,
      index + 1,
      input.generationNonce
    ),
  }));
}

function scoreSvg(svgMarkup: string, selectedName: string) {
  let score = 40;
  const normalized = svgMarkup.toLowerCase();

  if (normalized.includes("<lineargradient") || normalized.includes("<radialgradient")) score += 12;
  if (normalized.includes("<path")) score += 10;
  if (normalized.includes("<circle") || normalized.includes("<ellipse")) score += 6;
  if (normalized.includes("<polygon") || normalized.includes("<polyline")) score += 5;
  if (normalized.includes(selectedName.toLowerCase())) score += 12;
  if (svgMarkup.length > 700) score += 8;
  if (svgMarkup.length > 1200) score += 4;

  return score;
}

function scoreConcept(concept: LogoConceptRecord, selectedName: string) {
  let score = scoreSvg(concept.svgMarkup, selectedName);

  if (concept.title.length >= 10 && concept.title.length <= 26) score += 8;
  if (concept.subtitle.length >= 12 && concept.subtitle.length <= 48) score += 6;
  if (concept.rationale.length >= 90) score += 8;
  if (concept.generationPrompt.length >= 80) score += 5;
  if (!/^ai concept/i.test(concept.title)) score += 5;

  return clamp(score, 0, 100);
}

function conceptFingerprint(concept: LogoConceptRecord) {
  const svg = concept.svgMarkup.toLowerCase();
  const svgSignature = [
    svg.includes("<path") ? "path" : "",
    svg.includes("<circle") ? "circle" : "",
    svg.includes("<ellipse") ? "ellipse" : "",
    svg.includes("<rect") ? "rect" : "",
    svg.includes("<polygon") ? "polygon" : "",
    svg.includes("<lineargradient") ? "gradient" : "",
  ]
    .filter(Boolean)
    .join("-");

  return `${concept.title.toLowerCase()}|${concept.subtitle.toLowerCase()}|${svgSignature}|${svg.slice(0, 180)}`;
}

function conceptStyleKey(concept: LogoConceptRecord) {
  const svg = concept.svgMarkup.toLowerCase();
  const features = [
    svg.includes("<path"),
    svg.includes("<circle"),
    svg.includes("<ellipse"),
    svg.includes("<rect"),
    svg.includes("<polygon"),
    svg.includes("<lineargradient") || svg.includes("<radialgradient"),
  ];
  return features.map((value) => (value ? "1" : "0")).join("");
}

export function mergeAndRankLogoConcepts(concepts: LogoConceptRecord[], selectedName: string) {
  const seen = new Set<string>();
  const deduped = concepts
    .map((concept) => ({
      ...concept,
      qualityScore: scoreConcept(concept, selectedName),
    }))
    .filter((concept) => {
      const fingerprint = conceptFingerprint(concept);
      if (seen.has(fingerprint)) return false;
      seen.add(fingerprint);
      return true;
    })
    .sort((left, right) => (right.qualityScore || 0) - (left.qualityScore || 0));

  const picked: LogoConceptRecord[] = [];
  const usedStyles = new Set<string>();

  for (const concept of deduped) {
    const styleKey = conceptStyleKey(concept);
    if (!usedStyles.has(styleKey) || picked.length >= 3) {
      picked.push(concept);
      usedStyles.add(styleKey);
    }
    if (picked.length === 4) break;
  }

  for (const concept of deduped) {
    if (picked.length === 4) break;
    if (!picked.some((entry) => entry.id === concept.id)) {
      picked.push(concept);
    }
  }

  return picked.slice(0, 4);
}

export function buildLogoGenerationPrompt(input: GenerateLogoConceptsInput) {
  return [
    "You are Buildynex AI, a premium startup brand identity director and logo designer.",
    "Generate 4 different logo concepts for the selected startup name.",
    "Return JSON only with the exact shape {\"concepts\":[{\"title\":\"\",\"subtitle\":\"\",\"rationale\":\"\",\"generationPrompt\":\"\",\"svgMarkup\":\"<svg ...>...</svg>\"}]}",
    "Do not include markdown fences or commentary.",
    "Each svgMarkup must be a complete standalone SVG with viewBox=\"0 0 240 160\".",
    "Use only safe SVG elements: svg, defs, linearGradient, radialGradient, stop, rect, circle, ellipse, path, polygon, polyline, line, g, text.",
    "Do not use script, style, foreignObject, image, href, xlink, external assets, filters, masks, or CSS classes.",
    "Use a dark premium SaaS backdrop with the logo mark and wordmark visible inside the SVG.",
    "All 4 concepts must be visually distinct in geometry, symbol logic, and composition.",
    "Do not just repeat one monogram. Mix emblem, abstract symbol, monogram, and badge-like systems where appropriate.",
    "The selected startup name must appear as the wordmark in every SVG.",
    `Startup name: ${input.selectedName}.`,
    `Problem title: ${input.problem.title}.`,
    `Problem sector: ${input.problem.sector}.`,
    `Problem description: ${input.problem.description}.`,
    `Affected users: ${input.problem.affectedUsers}.`,
    `Opportunity tag: ${input.problem.opportunityTag}.`,
    `Brand positioning: ${input.branding.positioning}.`,
    `Brand personality: ${input.branding.personality.join(", ")}.`,
    `Brand color palette: ${input.branding.colorPalette.join(", ")}.`,
    `Typography direction: ${input.branding.typography}.`,
    `Existing logo brief: ${input.branding.logoPrompt}.`,
    `Creative swing token for a fresh generation: ${input.generationNonce || Date.now().toString()}.`,
    "Make the concepts feel like a funded startup identity system, not clipart.",
    "Keep text concise and commercially sharp.",
  ].join("\n");
}

export function normalizeGeneratedLogoConcepts(
  payload: unknown,
  input: GenerateLogoConceptsInput,
  sourceModel?: string
) {
  const concepts = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? [
          (payload as { concepts?: unknown }).concepts,
          (payload as { logos?: unknown }).logos,
          (payload as { logoConcepts?: unknown }).logoConcepts,
          (payload as { variants?: unknown }).variants,
          (payload as { results?: unknown }).results,
          (payload as { items?: unknown }).items,
        ].find((value) => Array.isArray(value)) || []
      : [];

  const normalized = concepts
    .map((item, index) => {
      const concept =
        typeof item === "string"
          ? normalizeConcept({ title: `AI Concept ${index + 1}`, svgMarkup: item }, index, input)
          : item && typeof item === "object"
            ? normalizeConcept(item as Record<string, unknown>, index, input)
            : null;

      if (!concept) return null;
      return sourceModel ? { ...concept, sourceModel } : concept;
    })
    .filter((item): item is LogoConceptRecord => item !== null)
    .slice(0, 4);

  return normalized.length ? normalized : createFallbackLogoConcepts(input);
}
