import { BrandingData, LogoConceptRecord, ProblemRecord } from "@/lib/types";

interface GenerateLogoConceptsInput {
  problem: ProblemRecord;
  branding: BrandingData;
  selectedName: string;
  generationNonce?: string;
}

type LogoDomainKey = "education" | "food" | "industry" | "generic";

type FallbackVariant = {
  title: string;
  subtitle: string;
  rationale: string;
};

type IconRenderer = (primary: string, secondary: string) => string;

const GENERIC_VARIANTS: FallbackVariant[] = [
  {
    title: "Category Mark",
    subtitle: "Clear sector-first identity",
    rationale:
      "A direct brand mark that makes the category legible at first glance instead of hiding behind abstract startup visuals.",
  },
  {
    title: "Operator Emblem",
    subtitle: "Functional execution symbol",
    rationale:
      "A more operational identity direction built for trust, clarity, and immediate recognition in the market.",
  },
  {
    title: "Field Signal",
    subtitle: "Problem-led commercial logo",
    rationale:
      "A practical logo concept that ties the symbol to the real-world workflow this startup wants to improve.",
  },
  {
    title: "Trust Badge",
    subtitle: "Premium launch-ready identity",
    rationale:
      "A more premium badge-style direction for teams that need authority and category recognition from day one.",
  },
];

const DOMAIN_VARIANTS: Record<LogoDomainKey, FallbackVariant[]> = {
  education: [
    {
      title: "Scholar Mark",
      subtitle: "Book-led learning identity",
      rationale:
        "This concept uses study symbolism so the logo immediately feels connected to students, learning systems, and education outcomes.",
    },
    {
      title: "Campus Crest",
      subtitle: "Academic trust symbol",
      rationale:
        "A more structured education mark that feels credible for student tools, academic platforms, and institution-facing products.",
    },
    {
      title: "Study Flow",
      subtitle: "Progress-driven learning icon",
      rationale:
        "A cleaner learning-system direction for products focused on student progress, study routines, and structured growth.",
    },
    {
      title: "Learning Signal",
      subtitle: "Modern education badge",
      rationale:
        "A launch-ready identity that still keeps a visible education cue instead of drifting into generic software branding.",
    },
  ],
  food: [
    {
      title: "Kitchen Mark",
      subtitle: "Food-first service identity",
      rationale:
        "This concept uses meal and hospitality cues so the brand instantly feels connected to food, kitchens, vendors, or ordering flows.",
    },
    {
      title: "Meal Signal",
      subtitle: "Operational food emblem",
      rationale:
        "A more systematic food-sector direction that still keeps clear visual references to plates, bowls, or service moments.",
    },
    {
      title: "Vendor Plate",
      subtitle: "Street-to-service logo system",
      rationale:
        "A practical identity for food startups that need to feel trustworthy, local, and easy to understand at first glance.",
    },
    {
      title: "Hospitality Crest",
      subtitle: "Premium dining category cue",
      rationale:
        "A higher-trust food and hospitality direction that still avoids generic SaaS shapes by staying rooted in culinary symbolism.",
    },
  ],
  industry: [
    {
      title: "Factory Grid",
      subtitle: "Industrial operations identity",
      rationale:
        "This concept makes the startup feel rooted in real industrial work with factory, production, or machinery cues.",
    },
    {
      title: "Forge Mark",
      subtitle: "Manufacturing trust emblem",
      rationale:
        "A bolder industrial direction built for manufacturing, factory tooling, and operations-heavy products.",
    },
    {
      title: "Plant Signal",
      subtitle: "Production-system symbol",
      rationale:
        "A cleaner industrial identity that still feels like it belongs in manufacturing instead of generic software.",
    },
    {
      title: "Assembly Crest",
      subtitle: "Execution-led industrial badge",
      rationale:
        "A stronger category mark for industrial teams that need credibility with plant operators, factories, and field buyers.",
    },
  ],
  generic: GENERIC_VARIANTS,
};

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

export function detectLogoDomain(
  problem: ProblemRecord,
  selectedName: string,
  branding: BrandingData
): LogoDomainKey {
  const haystack = [
    problem.sector,
    problem.title,
    problem.description,
    problem.affectedUsers,
    problem.realWorldContext,
    branding.positioning,
    branding.logoPrompt,
    selectedName,
  ]
    .join(" ")
    .toLowerCase();

  if (/(student|study|school|college|campus|education|learning|exam|class|teacher|tuition|academy)/.test(haystack)) {
    return "education";
  }
  if (/(food|meal|kitchen|restaurant|vendor|mess|canteen|street food|hospitality|dining|chef|cafe|grocery|nutrition)/.test(haystack)) {
    return "food";
  }
  if (/(industry|industrial|factory|manufacturing|plant|assembly|machine|machinery|warehouse|production)/.test(haystack)) {
    return "industry";
  }

  return "generic";
}

function domainCueLine(domain: LogoDomainKey) {
  switch (domain) {
    case "education":
      return "Use books, learning marks, graduation caps, notebooks, pencils, or academic symbols.";
    case "food":
      return "Use plates, bowls, cutlery, steam, food service, or vendor cues.";
    case "industry":
      return "Use factories, gears, production, assembly, or machinery cues.";
    default:
      return "Use a direct category symbol, not a random abstract shape.";
  }
}

function getDomainLabel(domain: LogoDomainKey) {
  switch (domain) {
    case "education":
      return "EDUCATION";
    case "food":
      return "FOOD";
    case "industry":
      return "INDUSTRY";
    default:
      return "CATEGORY";
  }
}

function renderEducationBookIcon(primary: string, secondary: string) {
  return [
    `<path d="M8 18 C18 14 26 14 32 20 C38 14 46 14 56 18 V50 C46 46 38 46 32 52 C26 46 18 46 8 50 Z" fill="rgba(255,255,255,0.08)" stroke="${primary}" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<path d="M32 20 V52" stroke="${primary}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<path d="M12 24 C20 21 26 21 32 26" stroke="${secondary}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<path d="M52 24 C44 21 38 21 32 26" stroke="${secondary}" stroke-width="2.5" stroke-linecap="round"/>`,
  ].join("");
}

function renderEducationCapIcon(primary: string, secondary: string) {
  return [
    `<path d="M8 22 L32 10 L56 22 L32 34 Z" fill="${secondary}" opacity="0.95"/>`,
    `<path d="M17 27 V39 C17 44 24 48 32 50 C40 48 47 44 47 39 V27" fill="rgba(255,255,255,0.08)" stroke="${primary}" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<path d="M56 22 V40" stroke="${primary}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<circle cx="56" cy="43" r="3.5" fill="${secondary}"/>`,
  ].join("");
}

function renderEducationPencilIcon(primary: string, secondary: string) {
  return [
    `<rect x="10" y="12" width="34" height="42" rx="6" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.5"/>`,
    `<path d="M18 22 H36 M18 30 H32 M18 38 H34" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<path d="M46 44 L54 52 L30 56 L34 32 Z" fill="${secondary}" opacity="0.92"/>`,
    `<path d="M34 32 L46 44" stroke="${primary}" stroke-width="2.2" stroke-linecap="round"/>`,
  ].join("");
}

function renderEducationCampusIcon(primary: string, secondary: string) {
  return [
    `<path d="M10 50 V28 L32 14 L54 28 V50" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<path d="M20 50 V34 H28 V50 M36 50 V34 H44 V50" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<path d="M22 24 H42" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
  ].join("");
}

function renderEducationDiplomaIcon(primary: string, secondary: string) {
  return [
    `<rect x="10" y="16" width="44" height="30" rx="6" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.4"/>`,
    `<path d="M18 24 H46 M18 31 H42" stroke="${secondary}" stroke-width="2.2" stroke-linecap="round"/>`,
    `<path d="M18 46 C23 54 29 56 32 56 C35 56 41 54 46 46" stroke="${primary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<circle cx="26" cy="50" r="4.5" fill="${secondary}" opacity="0.9"/>`,
    `<circle cx="38" cy="50" r="4.5" fill="${secondary}" opacity="0.9"/>`,
  ].join("");
}

function renderEducationBrainIcon(primary: string, secondary: string) {
  return [
    `<path d="M24 12 C18 12 14 16 14 22 C10 24 8 28 8 33 C8 40 13 45 20 45 H44 C51 45 56 40 56 33 C56 28 54 24 50 22 C50 16 46 12 40 12 C36 8 28 8 24 12 Z" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<path d="M24 18 C28 20 28 24 24 26 M40 18 C36 20 36 24 40 26" stroke="${secondary}" stroke-width="2.2" stroke-linecap="round"/>`,
    `<path d="M32 18 V38 M24 32 H40" stroke="${secondary}" stroke-width="2.2" stroke-linecap="round"/>`,
  ].join("");
}

function renderFoodPlateIcon(primary: string, secondary: string) {
  return [
    `<circle cx="32" cy="34" r="18" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.5"/>`,
    `<circle cx="32" cy="34" r="9" fill="none" stroke="${secondary}" stroke-width="2.5"/>`,
    `<path d="M13 16 V46" stroke="${primary}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<path d="M9 16 V26 M13 16 V26 M17 16 V26" stroke="${primary}" stroke-width="2.2" stroke-linecap="round"/>`,
    `<path d="M51 16 C47 24 47 31 51 46" stroke="${primary}" stroke-width="2.5" stroke-linecap="round"/>`,
  ].join("");
}

function renderFoodBowlIcon(primary: string, secondary: string) {
  return [
    `<path d="M12 30 H52 C51 43 44 51 32 54 C20 51 13 43 12 30 Z" fill="rgba(255,255,255,0.08)" stroke="${primary}" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<path d="M20 54 H44" stroke="${secondary}" stroke-width="2.4" stroke-linecap="round"/>`,
    `<path d="M24 12 C22 16 22 20 25 24" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<path d="M32 10 C30 15 30 19 33 24" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<path d="M40 12 C38 16 38 20 41 24" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
  ].join("");
}

function renderFoodClocheIcon(primary: string, secondary: string) {
  return [
    `<path d="M12 40 H52" stroke="${primary}" stroke-width="2.6" stroke-linecap="round"/>`,
    `<path d="M16 40 C18 24 26 16 32 16 C38 16 46 24 48 40 Z" fill="rgba(255,255,255,0.08)" stroke="${primary}" stroke-width="2.5"/>`,
    `<circle cx="32" cy="14" r="4" fill="${secondary}"/>`,
    `<path d="M22 47 H42" stroke="${secondary}" stroke-width="2.4" stroke-linecap="round"/>`,
  ].join("");
}

function renderFoodVendorIcon(primary: string, secondary: string) {
  return [
    `<rect x="12" y="24" width="40" height="28" rx="4" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.5"/>`,
    `<path d="M12 24 L18 14 H46 L52 24" fill="none" stroke="${secondary}" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<path d="M18 32 H46" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<path d="M24 40 H30 M34 40 H40" stroke="${primary}" stroke-width="2.2" stroke-linecap="round"/>`,
  ].join("");
}

function renderFoodChefHatIcon(primary: string, secondary: string) {
  return [
    `<path d="M18 24 C18 16 24 12 30 16 C34 10 42 10 46 16 C52 14 56 18 56 24 C56 30 52 34 46 34 H22 C16 34 12 30 12 24 C12 18 15 15 18 16" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<path d="M22 34 V48 H46 V34" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<path d="M24 42 H44" stroke="${primary}" stroke-width="2.1" stroke-linecap="round"/>`,
  ].join("");
}

function renderFoodLeafForkIcon(primary: string, secondary: string) {
  return [
    `<path d="M18 12 V46" stroke="${primary}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<path d="M14 12 V22 M18 12 V22 M22 12 V22" stroke="${primary}" stroke-width="2.1" stroke-linecap="round"/>`,
    `<path d="M36 50 C46 46 54 36 54 24 C44 24 36 32 32 42 C30 34 24 28 16 24 C16 36 22 44 32 50 Z" fill="rgba(255,255,255,0.06)" stroke="${secondary}" stroke-width="2.3" stroke-linejoin="round"/>`,
  ].join("");
}

function renderIndustryFactoryIcon(primary: string, secondary: string) {
  return [
    `<path d="M8 48 V30 L18 36 V26 L30 34 V22 H42 V30 H56 V48 Z" fill="rgba(255,255,255,0.08)" stroke="${primary}" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<rect x="40" y="10" width="8" height="20" rx="2" fill="${secondary}" opacity="0.92"/>`,
    `<path d="M43 10 C40 7 40 4 43 1" stroke="${primary}" stroke-width="2.3" stroke-linecap="round"/>`,
    `<path d="M47 10 C50 7 50 4 47 1" stroke="${primary}" stroke-width="2.3" stroke-linecap="round"/>`,
  ].join("");
}

function renderIndustryGearIcon(primary: string, secondary: string) {
  return [
    `<circle cx="32" cy="32" r="10" fill="rgba(255,255,255,0.05)" stroke="${primary}" stroke-width="2.5"/>`,
    `<path d="M32 14 V8 M32 56 V50 M50 32 H56 M8 32 H14 M45 19 L49 15 M15 49 L19 45 M45 45 L49 49 M15 15 L19 19" stroke="${secondary}" stroke-width="2.4" stroke-linecap="round"/>`,
    `<circle cx="32" cy="32" r="20" fill="none" stroke="${primary}" stroke-width="2.5" stroke-dasharray="10 8"/>`,
  ].join("");
}

function renderIndustryCraneIcon(primary: string, secondary: string) {
  return [
    `<path d="M14 52 V10 H22 V52" stroke="${primary}" stroke-width="2.6" stroke-linecap="round"/>`,
    `<path d="M22 14 H50 L42 24 H30" stroke="${secondary}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="M40 24 V38" stroke="${primary}" stroke-width="2.4" stroke-linecap="round"/>`,
    `<rect x="34" y="38" width="12" height="10" rx="2" fill="rgba(255,255,255,0.08)" stroke="${secondary}" stroke-width="2"/>`,
    `<path d="M10 52 H54" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/>`,
  ].join("");
}

function renderIndustryConveyorIcon(primary: string, secondary: string) {
  return [
    `<path d="M10 42 H54" stroke="${primary}" stroke-width="2.6" stroke-linecap="round"/>`,
    `<circle cx="18" cy="46" r="4" fill="${secondary}"/>`,
    `<circle cx="46" cy="46" r="4" fill="${secondary}"/>`,
    `<rect x="14" y="24" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.2"/>`,
    `<rect x="29" y="18" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.2"/>`,
    `<rect x="42" y="24" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.2"/>`,
  ].join("");
}

function renderIndustryWarehouseIcon(primary: string, secondary: string) {
  return [
    `<path d="M10 26 L32 12 L54 26 V52 H10 Z" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<path d="M20 36 H28 V52 M36 36 H44 V52" stroke="${secondary}" stroke-width="2.2" stroke-linecap="round"/>`,
    `<path d="M18 28 H46" stroke="${secondary}" stroke-width="2.2" stroke-linecap="round"/>`,
  ].join("");
}

function renderIndustryShieldIcon(primary: string, secondary: string) {
  return [
    `<path d="M32 10 L50 18 V34 C50 45 43 53 32 56 C21 53 14 45 14 34 V18 Z" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<path d="M24 32 L30 38 L40 24" stroke="${secondary}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  ].join("");
}

function renderGenericIcon(primary: string, secondary: string) {
  return [
    `<circle cx="32" cy="32" r="22" fill="rgba(255,255,255,0.06)" stroke="${primary}" stroke-width="2.5"/>`,
    `<path d="M22 33 L29 40 L43 25" stroke="${secondary}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    `<path d="M18 18 L22 22 M42 18 L46 22 M18 46 L22 42 M42 46 L46 42" stroke="${primary}" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>`,
  ].join("");
}

const EDUCATION_ICON_FAMILIES: IconRenderer[] = [
  renderEducationBookIcon,
  renderEducationCapIcon,
  renderEducationPencilIcon,
  renderEducationCampusIcon,
  renderEducationDiplomaIcon,
  renderEducationBrainIcon,
];

const FOOD_ICON_FAMILIES: IconRenderer[] = [
  renderFoodPlateIcon,
  renderFoodBowlIcon,
  renderFoodClocheIcon,
  renderFoodVendorIcon,
  renderFoodChefHatIcon,
  renderFoodLeafForkIcon,
];

const INDUSTRY_ICON_FAMILIES: IconRenderer[] = [
  renderIndustryFactoryIcon,
  renderIndustryGearIcon,
  renderIndustryCraneIcon,
  renderIndustryConveyorIcon,
  renderIndustryWarehouseIcon,
  renderIndustryShieldIcon,
];

function pickFamilySequence(families: IconRenderer[], seed: number) {
  const pool = families.map((_, index) => index);
  const rand = mulberry32(seed);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rand() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, 4);
}

function renderDomainIcon(domain: LogoDomainKey, primary: string, secondary: string, familyIndex: number) {
  switch (domain) {
    case "education":
      return EDUCATION_ICON_FAMILIES[familyIndex % EDUCATION_ICON_FAMILIES.length](primary, secondary);
    case "food":
      return FOOD_ICON_FAMILIES[familyIndex % FOOD_ICON_FAMILIES.length](primary, secondary);
    case "industry":
      return INDUSTRY_ICON_FAMILIES[familyIndex % INDUSTRY_ICON_FAMILIES.length](primary, secondary);
    default:
      return renderGenericIcon(primary, secondary);
  }
}

function fallbackLogoSvg(input: GenerateLogoConceptsInput, variantIndex: number) {
  const palette = [
    input.branding.colorPalette[0] || "#050816",
    input.branding.colorPalette[1] || "#10172a",
    input.branding.colorPalette[2] || "#7c3aed",
    input.branding.colorPalette[3] || "#38bdf8",
    input.branding.colorPalette[4] || "#e2e8f0",
  ];
  const domain = detectLogoDomain(input.problem, input.selectedName, input.branding);
  const label = `${getDomainLabel(domain)} / ${input.problem.opportunityTag.toUpperCase()}`;
  const familySeed = hashString(`${input.selectedName}:${domain}:${input.generationNonce || "static"}`);
  const familySequence = domain === "education"
    ? pickFamilySequence(EDUCATION_ICON_FAMILIES, familySeed)
    : domain === "food"
      ? pickFamilySequence(FOOD_ICON_FAMILIES, familySeed)
      : domain === "industry"
        ? pickFamilySequence(INDUSTRY_ICON_FAMILIES, familySeed)
        : [0, 0, 0, 0];
  const familyIndex = familySequence[(variantIndex - 1 + familySequence.length) % familySequence.length];
  const rand = mulberry32(
    hashString(`${input.selectedName}:${domain}:${variantIndex}:${input.generationNonce || "static"}`)
  );
  const gradientId = `brand-gradient-${variantIndex}-${Math.round(rand() * 10000)}`;
  const iconMarkup = renderDomainIcon(domain, "#ffffff", palette[3], familyIndex);
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
      `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${input.selectedName} logo">`,
      ...commonDefs,
      `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[0]}"/>`,
      `<rect x="18" y="18" width="86" height="86" rx="24" fill="url(#${gradientId})"/>`,
      `<g transform="translate(28 28)">${iconMarkup}</g>`,
      `<circle cx="182" cy="42" r="18" fill="${palette[3]}" opacity="0.14"/>`,
      `<text x="122" y="64" fill="${palette[4]}" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">${input.selectedName}</text>`,
      `<text x="122" y="90" fill="#94a3b8" font-size="10" letter-spacing="1.8" font-family="Arial, Helvetica, sans-serif">${label}</text>`,
      `<path d="M28 122 C58 100 86 100 116 122" stroke="rgba(255,255,255,0.14)" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      "</svg>",
    ].join("");
  }

  if (variantIndex === 2) {
    return [
      `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${input.selectedName} logo">`,
      ...commonDefs,
      `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[1]}"/>`,
      `<circle cx="72" cy="78" r="34" fill="${palette[0]}" stroke="${palette[3]}" stroke-width="2.5"/>`,
      `<circle cx="72" cy="78" r="46" fill="none" stroke="url(#${gradientId})" stroke-width="4" stroke-dasharray="16 12" opacity="0.95"/>`,
      `<g transform="translate(40 46)">${iconMarkup}</g>`,
      `<text x="128" y="70" fill="${palette[4]}" font-size="21" font-weight="700" font-family="Arial, Helvetica, sans-serif">${input.selectedName}</text>`,
      `<text x="128" y="96" fill="#94a3b8" font-size="11" letter-spacing="1.6" font-family="Arial, Helvetica, sans-serif">${getDomainLabel(domain)} SYSTEM</text>`,
      "</svg>",
    ].join("");
  }

  if (variantIndex === 3) {
    return [
      `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${input.selectedName} logo">`,
      ...commonDefs,
      `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[0]}"/>`,
      `<path d="M26 26 L98 26 L110 42 V98 C110 116 94 130 72 136 C50 130 34 116 34 98 V42 Z" fill="url(#${gradientId})"/>`,
      `<path d="M40 38 H96 L102 46 V96 C102 110 90 120 72 126 C54 120 42 110 42 96 V46 Z" fill="${palette[1]}" opacity="0.2"/>`,
      `<g transform="translate(40 44)">${iconMarkup}</g>`,
      `<text x="128" y="72" fill="${palette[4]}" font-size="21" font-weight="700" font-family="Arial, Helvetica, sans-serif">${input.selectedName}</text>`,
      `<text x="128" y="98" fill="#94a3b8" font-size="11" letter-spacing="1.6" font-family="Arial, Helvetica, sans-serif">${getDomainLabel(domain)} TRUST</text>`,
      "</svg>",
    ].join("");
  }

  return [
    `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${input.selectedName} logo">`,
    ...commonDefs,
    `<rect x="0" y="0" width="240" height="160" rx="28" fill="${palette[1]}"/>`,
    `<rect x="16" y="44" width="92" height="72" rx="22" fill="${palette[0]}" stroke="url(#${gradientId})" stroke-width="2"/>`,
    `<g transform="translate(30 48)">${iconMarkup}</g>`,
    `<path d="M108 80 C124 80 136 66 152 66 C168 66 178 80 194 80" stroke="${palette[3]}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.75"/>`,
    `<circle cx="194" cy="80" r="8" fill="${palette[2]}" opacity="0.7"/>`,
    `<text x="122" y="62" fill="${palette[4]}" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif">${input.selectedName}</text>`,
    `<text x="122" y="90" fill="#94a3b8" font-size="10" letter-spacing="1.8" font-family="Arial, Helvetica, sans-serif">${label}</text>`,
    "</svg>",
  ].join("");
}

function normalizeConcept(
  raw: Record<string, unknown>,
  index: number,
  input: GenerateLogoConceptsInput
): LogoConceptRecord {
  const domain = detectLogoDomain(input.problem, input.selectedName, input.branding);
  const title = asString(raw.title, `AI Concept ${index + 1}`);
  const subtitle = asString(raw.subtitle, "AI generated category logo");
  const rationale = asString(
    raw.rationale,
    `This concept turns the ${input.problem.sector.toLowerCase()} problem into a domain-specific identity for ${input.selectedName} instead of a generic startup mark.`
  );
  const generationPrompt = asString(
    raw.generationPrompt,
    `${input.selectedName} domain-specific startup logo for ${input.problem.title} in ${input.problem.sector}. ${domainCueLine(domain)} Premium, clean, scalable, and clearly tied to the category.`
  );
  const svgMarkup = fallbackLogoSvg(input, index + 1);

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
  const domain = detectLogoDomain(input.problem, input.selectedName, input.branding);
  const variants = DOMAIN_VARIANTS[domain] || GENERIC_VARIANTS;

  return variants.map((variant, index) => ({
    id: slugify(`${input.selectedName}-${variant.title}-${input.generationNonce || index + 1}`),
    title: variant.title,
    subtitle: variant.subtitle,
    rationale: `${variant.rationale} It is tuned to the ${input.problem.sector.toLowerCase()} context and the problem "${input.problem.title}".`,
    generationPrompt: `${input.selectedName} logo for a ${input.problem.sector} startup solving ${input.problem.title}. ${domainCueLine(domain)} Use ${input.branding.colorPalette.join(", ")} in a premium dark startup identity.`,
    svgMarkup: fallbackLogoSvg(input, index + 1),
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

function scoreDomainFit(concept: LogoConceptRecord, domain: LogoDomainKey) {
  if (domain === "generic") return 6;

  const searchable = [
    concept.title,
    concept.subtitle,
    concept.rationale,
    concept.generationPrompt,
    concept.svgMarkup,
  ]
    .join(" ")
    .toLowerCase();

  const keywordGroups: Record<Exclude<LogoDomainKey, "generic">, string[]> = {
    education: ["study", "student", "school", "college", "campus", "book", "learning", "education"],
    food: ["food", "meal", "plate", "kitchen", "vendor", "dining", "hospitality", "canteen"],
    industry: ["industry", "industrial", "factory", "manufacturing", "plant", "assembly", "machine", "production"],
  };

  const matches = keywordGroups[domain].reduce((count, keyword) => {
    return count + (searchable.includes(keyword) ? 1 : 0);
  }, 0);

  if (matches >= 5) return 20;
  if (matches >= 3) return 14;
  if (matches >= 1) return 8;

  return -12;
}

function scoreConcept(concept: LogoConceptRecord, selectedName: string, domain: LogoDomainKey) {
  let score = scoreSvg(concept.svgMarkup, selectedName);
  score += scoreDomainFit(concept, domain);

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

  return `${svgSignature}|${svg.slice(0, 320)}`;
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

export function mergeAndRankLogoConcepts(
  concepts: LogoConceptRecord[],
  selectedName: string,
  domain: LogoDomainKey = "generic"
) {
  const seen = new Set<string>();
  const deduped = concepts
    .map((concept) => ({
      ...concept,
      qualityScore: scoreConcept(concept, selectedName, domain),
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
  const domain = detectLogoDomain(input.problem, input.selectedName, input.branding);

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
    "Every concept must communicate the startup category at first glance.",
    "Avoid random abstract marks that could belong to any company.",
    "If the startup is education or study related, use study symbolism like books, graduation caps, notebooks, pencils, or campus cues.",
    "If the startup is food or hospitality related, use plates, bowls, spoons, forks, food service, steam, stalls, or vendor cues.",
    "If the startup is manufacturing or industry related, use factories, gears, plants, production, or machinery cues.",
    "Do not just repeat one monogram. The icon should carry semantic meaning from the sector.",
    "The selected startup name must appear as the wordmark in every SVG.",
    `Detected domain: ${domain}. ${domainCueLine(domain)}`,
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
    "Keep text concise, commercially sharp, and category-legible.",
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

