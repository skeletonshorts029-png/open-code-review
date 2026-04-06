import { BrandingData, ProblemRecord, RoadmapStep, SolutionData, UserRole } from "@/lib/types";

function titlePrefix(role: UserRole) {
  switch (role) {
    case "Student":
      return "Launch lean and learn fast";
    case "Founder":
      return "Build a venture-scale wedge";
    case "Investor":
      return "Assess fundable startup posture";
    default:
      return "Shape a strong startup path";
  }
}

export function getSolutionData(problem: ProblemRecord, role: UserRole): SolutionData {
  if (role === "Student") {
    return {
      headline: `${titlePrefix(role)} around ${problem.sector.toLowerCase()} pain`,
      summary: `A student-friendly version of this idea focuses on a narrow user segment, simple workflow automation, and a low-cost proof of value that can be built with no-code tools plus lightweight AI.` ,
      sections: [
        {
          title: "Beginner-Friendly Startup Concept",
          points: [
            `Build a focused tool that helps ${problem.targetUsers[0].toLowerCase()} solve one painful step in the ${problem.title.toLowerCase()} workflow.`,
            "Start with a concierge service or manual MVP before automating everything.",
            "Use interviews and landing pages to validate that users feel the pain frequently."
          ]
        },
        {
          title: "Low-Cost Launch Version",
          points: [
            "Use Supabase, a simple dashboard, and AI-assisted summaries instead of a heavy backend.",
            "Offer one clear promise: save time, reduce confusion, or improve visibility.",
            "Charge later after proving repeat usage with a pilot cohort."
          ]
        },
        {
          title: "Skills Needed",
          points: [
            "Customer interviews and problem discovery",
            "Basic product design and no-code or React fundamentals",
            "Storytelling so users understand the before-and-after outcome"
          ]
        },
        {
          title: "First Steps",
          points: [
            `Interview 10 people who face ${problem.title.toLowerCase()}.`,
            "Map the most expensive or frustrating workflow step.",
            "Ship a clickable prototype or manual service within one week."
          ]
        }
      ]
    };
  }

  if (role === "Founder") {
    return {
      headline: `${titlePrefix(role)} in ${problem.sector}`,
      summary: `This solution turns the problem into a focused B2B SaaS wedge with measurable ROI, role-based dashboards, and AI recommendations that help teams act faster.` ,
      sections: [
        {
          title: "Startup Solution",
          points: [
            `Create a workflow intelligence platform that helps teams detect, prioritize, and resolve ${problem.title.toLowerCase()}.`,
            "Combine operational data, AI scoring, and guided next actions in one product surface.",
            "Win early by solving one urgent workflow better than horizontal tools."
          ]
        },
        {
          title: "Value Proposition",
          points: [
            "Reduce delay, uncertainty, and manual work for frontline operators.",
            "Give leaders a clearer view of demand, urgency, and impact.",
            "Turn fragmented signals into one decision-ready product layer."
          ]
        },
        {
          title: "ICP / Target Audience",
          points: [
            `Primary ICP: ${problem.targetUsers.join(", ")}`,
            "Economic buyer: team leaders under pressure to improve outcomes or margins.",
            "Champion: operators who currently coordinate the pain manually."
          ]
        },
        {
          title: "Business Model",
          points: [
            "SaaS subscription priced by team size or workflow volume.",
            "Pilot onboarding fee for setup and workflow mapping.",
            "Expansion revenue through analytics modules and premium automations."
          ]
        },
        {
          title: "Monetization Model",
          points: [
            "Land with one painkiller workflow and expand to adjacent jobs-to-be-done.",
            "Add premium reporting and AI recommendation credits for power users.",
            "Consider enterprise contracts once ROI data is clear."
          ]
        },
        {
          title: "Go-To-Market Strategy",
          points: [
            `Start with a niche inside ${problem.sector.toLowerCase()} where urgency is already high.`,
            "Use founder-led sales, workflow audits, and benchmark reports.",
            "Turn pilot results into case studies that quantify time or revenue saved."
          ]
        }
      ]
    };
  }

  return {
    headline: `${titlePrefix(role)} for ${problem.sector.toLowerCase()} software`,
    summary: `From an investor lens, the strongest angle is a workflow-native platform with painful urgency, expansion potential, and a path to defensibility through embedded data.` ,
    sections: [
      {
        title: "Opportunity Summary",
        points: [
          `The market pain is concrete, recurring, and tied to measurable losses around ${problem.title.toLowerCase()}.`,
          "Adoption risk is lower when the product saves teams time before asking them to change upstream systems.",
          "Strongest case exists when the startup becomes system-of-action, not just reporting."
        ]
      },
      {
        title: "Startup Angle",
        points: [
          "Back a focused vertical wedge before moving horizontal.",
          "Look for teams that can turn workflow data into better recommendations over time.",
          "Favor founders with direct access to frontline user interviews."
        ]
      },
      {
        title: "Market Attractiveness",
        points: [
          `Demand score of ${problem.demandScore}/100 shows meaningful urgency.`,
          `Monetization score of ${problem.monetizationScore}/100 suggests budget exists if ROI is measurable.`,
          `Competition at ${problem.competitionScore}/100 leaves room for a sharper wedge.`
        ]
      },
      {
        title: "Competition Insight",
        points: [
          "Horizontal platforms often stop at dashboards and leave action layers weak.",
          "Incumbents can be slow to serve niche workflow needs with modern UX.",
          "Differentiation likely comes from proprietary operational context and faster implementation."
        ]
      },
      {
        title: "Investment Thesis",
        points: [
          "Compelling if the startup shows fast time-to-value in a narrow vertical.",
          "Best case is a product that expands naturally across adjacent operational pain points.",
          "Strong proof points include pilot conversion, workflow depth, and team retention."
        ]
      },
      {
        title: "Risk Summary",
        points: [
          "Category creation may require education if the pain is not already budgeted.",
          `Difficulty score of ${problem.difficultyScore}/100 implies moderate implementation risk.`,
          "Execution risk rises if the team tries to serve too many personas too early."
        ]
      }
    ]
  };
}

export function getRoadmapData(problem: ProblemRecord, role: UserRole): RoadmapStep[] {
  const lens =
    role === "Student"
      ? "Keep the scope tiny and interview-driven."
      : role === "Founder"
        ? "Design each phase to prove ROI fast."
        : "Focus on de-risking market, product, and expansion assumptions.";

  return [
    {
      phase: "Research",
      duration: "Week 1",
      status: "Ready",
      ownerLens: lens,
      focus: "Clarify the sharpest user pain and the moment it becomes expensive enough to fix.",
      successMetric: "10 high-signal interviews completed with one repeated pain pattern confirmed.",
      keyRisk: "Talking to users who feel the issue only occasionally and overestimating urgency.",
      outputs: [
        `Interview target users affected by ${problem.title.toLowerCase()}.`,
        "Rank the most expensive workflow pain.",
        "Define one measurable success metric."
      ]
    },
    {
      phase: "Validation",
      duration: "Weeks 2-3",
      status: "In Progress",
      ownerLens: lens,
      focus: "Prove that the problem is painful enough for users to engage, respond, or pay.",
      successMetric: "3-5 pilot users agree to test the concept or show strong willingness-to-pay.",
      keyRisk: "Collecting polite interest instead of commitment signals like pilots, demos, or deposits.",
      outputs: [
        "Test messaging on landing pages or outbound conversations.",
        "Run manual pilots before automating the workflow.",
        "Collect willingness-to-pay signals and objections."
      ]
    },
    {
      phase: "MVP",
      duration: "Weeks 4-6",
      status: "Up Next",
      ownerLens: lens,
      focus: "Ship the smallest usable product that removes one painful workflow bottleneck.",
      successMetric: "Pilot users complete the core workflow repeatedly without manual hand-holding.",
      keyRisk: "Trying to build a full platform before proving one sticky use case.",
      outputs: [
        "Launch a focused dashboard with scorecards and action prompts.",
        "Instrument retention and engagement events.",
        "Ship only the narrowest workflow needed for repeat usage."
      ]
    },
    {
      phase: "Branding",
      duration: "Week 7",
      status: "Up Next",
      ownerLens: lens,
      focus: "Translate the product wedge into a credible category story and visual direction.",
      successMetric: "Prospects understand the problem, outcome, and product angle in under 30 seconds.",
      keyRisk: "Branding the startup too broadly and losing the painkiller positioning.",
      outputs: [
        "Create a sharp category narrative and positioning statement.",
        "Align UI language with the operational pain users feel.",
        "Prepare a customer-ready product demo."
      ]
    },
    {
      phase: "Launch",
      duration: "Weeks 8-9",
      status: "Up Next",
      ownerLens: lens,
      focus: "Convert early validation into a repeatable launch motion with social proof.",
      successMetric: "First active users onboarded with at least one measurable proof point captured.",
      keyRisk: "Launching publicly before onboarding and support are tight enough for early retention.",
      outputs: [
        "Activate first design partners or beta users.",
        "Publish proof points from pilots.",
        "Turn onboarding into a repeatable checklist."
      ]
    },
    {
      phase: "Growth",
      duration: "Weeks 10-12",
      status: "Up Next",
      ownerLens: lens,
      focus: "Expand from the initial wedge without weakening product clarity or retention.",
      successMetric: "Clear evidence of retention, expansion demand, or repeat acquisition from the first wedge.",
      keyRisk: "Scaling acquisition before the core product and onboarding loop are truly repeatable.",
      outputs: [
        "Expand into adjacent pain points after strong retention.",
        "Build referral loops or ecosystem partnerships.",
        "Review pricing, gross margin, and expansion opportunities."
      ]
    }
  ];
}

export function getBrandingData(problem: ProblemRecord): BrandingData {
  const sectorWord = problem.sector.replace(/\s+/g, "");
  return {
    nameIdeas: [`${sectorWord}Pulse`, `${sectorWord}Nexus`, `${sectorWord}Signal`],
    taglineIdeas: [
      "See the hidden problem before the market does.",
      "Turn operational pain into decisive momentum.",
      "Build with clarity where the demand is real."
    ],
    positioning: `An AI-first platform that helps teams move from ${problem.sector.toLowerCase()} pain discovery to startup execution with sharper conviction.`,
    logoPrompt:
      "Design a minimal futuristic SaaS logo with a luminous signal mark, deep navy background, soft cyan-violet gradients, and precise geometric lines that imply discovery and intelligence.",
    colorPalette: ["#050816", "#121A31", "#8B5CF6", "#38BDF8", "#E2E8F0"],
    typography: "Space Grotesk for headlines paired with Plus Jakarta Sans for product UI and long-form clarity.",
    personality: ["Analytical", "Optimistic", "Credible", "Future-facing", "Precise"]
  };
}

