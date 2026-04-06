import { ProblemRecord } from "@/lib/types";

export const mockProblems: ProblemRecord[] = [
  {
    id: "hospitality-linen-loss-turnaround",
    title: "Hotels lose room revenue because linen shrinkage and housekeeping turnaround are invisible in real time",
    description:
      "Housekeeping teams, laundry vendors, and floor supervisors operate without a live view of linen movement, cart readiness, or room turnaround bottlenecks, so hotels miss check-in readiness and keep replacing missing inventory.",
    affectedUsers: "Hotel operators, housekeeping managers, outsourced laundry vendors, and front desk teams",
    sector: "Hospitality",
    realWorldContext:
      "This problem shows up between laundry rooms, housekeeping carts, storage closets, and guest-ready rooms during peak turnover windows.",
    severity: "High",
    demandScore: 93,
    monetizationScore: 87,
    difficultyScore: 56,
    competitionScore: 42,
    buildynexScore: 90,
    aiExplanation:
      "The pain is operational, measurable, and tied directly to room availability, replacement cost, and guest experience. It is highly attractive because the ROI can be proven quickly with one property group.",
    opportunityTag: "Infrastructure Gap",
    whyItExists:
      "Most hotels still count linen manually, rely on verbal handoffs across shifts, and only notice shortages after room readiness slips or replacement costs spike.",
    painPoints: [
      "Rooms remain blocked because the right linen set is missing at the wrong time",
      "Hotels reorder towels and sheets without knowing where shrinkage actually happens",
      "Supervisors cannot see whether delays come from carts, laundry, or staffing",
      "Guest satisfaction drops when early check-in and room readiness are missed"
    ],
    marketNeedSummary:
      "Hotel groups want a lightweight operations layer that improves room readiness and linen control without replacing their PMS or housekeeping tools.",
    targetUsers: ["Hotel general managers", "Housekeeping supervisors", "Laundry operations leads"],
    serviceBusinessIdeas: [
      "Managed linen-audit service for mid-market hotel groups",
      "Operations consulting plus room-readiness optimization dashboards",
      "Vendor performance monitoring service for outsourced hotel laundry chains"
    ],
    physicalProductIdeas: [
      "RFID linen tag starter kit for towels, sheets, and robes",
      "Weight-sensing housekeeping cart module that detects load anomalies",
      "Closet dock with room-readiness scan station for floor teams"
    ],
    recommendationFor: ["Founder", "Investor"]
  },
  {
    id: "food-service-temperature-compliance",
    title: "Commercial kitchens lose margin because food holding temperatures are logged late and manually",
    description:
      "Restaurants, cloud kitchens, and catering teams often record temperature checks after the fact, which means spoilage, compliance misses, and batch waste are discovered too late to prevent loss.",
    affectedUsers: "Kitchen managers, food safety officers, franchise operators, and prep teams",
    sector: "Food Service",
    realWorldContext:
      "The pain happens on prep lines, hot-hold cabinets, cold rooms, dispatch counters, and delivery staging racks where teams juggle speed and compliance together.",
    severity: "High",
    demandScore: 91,
    monetizationScore: 89,
    difficultyScore: 52,
    competitionScore: 48,
    buildynexScore: 89,
    aiExplanation:
      "This is a real operational pain with regulatory pressure, visible food waste, and strong buyer urgency. The best wedge is workflow control for multi-site operators rather than generic IoT monitoring.",
    opportunityTag: "Fast-Growth",
    whyItExists:
      "Temperature logging is still handled with clipboards, disconnected probes, or staff memory, so the system records compliance but does not help teams act before inventory is lost.",
    painPoints: [
      "Kitchens discard batches that drifted out of range without early warning",
      "Managers cannot prove compliance cleanly across multiple sites",
      "Franchise operators discover repeat violations only during audits",
      "Rush-hour staff skip logging because it slows service"
    ],
    marketNeedSummary:
      "Food operators want a faster way to protect margin and compliance without forcing staff into another complex back-office system.",
    targetUsers: ["Multi-site kitchen operators", "Food safety managers", "Cloud kitchen owners"],
    serviceBusinessIdeas: [
      "Food-safety operations service for franchise groups with recurring audits",
      "Compliance monitoring service bundled with weekly loss reports",
      "Kitchen process optimization service for high-throughput food brands"
    ],
    physicalProductIdeas: [
      "Wireless smart temperature probe kit for hot-hold and cold storage",
      "Color-coded smart tray tag that flags time-temperature exposure",
      "Dispatch counter sensor strip that detects unsafe holding windows"
    ],
    recommendationFor: ["Founder", "Investor", "Student"]
  },
  {
    id: "home-care-medication-proof",
    title: "Home care agencies cannot reliably verify medication adherence and hydration between caregiver visits",
    description:
      "Care agencies depend on paper notes, phone calls, and family updates to know whether medication was actually taken and whether hydration routines were followed between visits.",
    affectedUsers: "Home care agencies, caregivers, families, elderly patients, and care coordinators",
    sector: "Home Care",
    realWorldContext:
      "This problem appears in patient homes, care kits, medication drawers, and shift handoffs where the agency only sees fragments of what happened between visits.",
    severity: "High",
    demandScore: 88,
    monetizationScore: 82,
    difficultyScore: 61,
    competitionScore: 36,
    buildynexScore: 87,
    aiExplanation:
      "The problem is emotionally urgent, compliance-sensitive, and operationally messy, which makes it valuable if the product stays simple and trust-first. It also opens both service and device pathways.",
    opportunityTag: "White Space",
    whyItExists:
      "Agencies are expected to show quality outcomes, but most do not have continuous in-home visibility and cannot rely on family members to document routines consistently.",
    painPoints: [
      "Missed doses go unnoticed until health declines or hospitalization risk rises",
      "Families do not trust agency notes when proof is inconsistent",
      "Care coordinators spend hours calling to reconstruct what happened",
      "Hydration and wellness routines are easy to miss when shifts change"
    ],
    marketNeedSummary:
      "Care providers want a low-friction way to prove adherence, improve family trust, and reduce preventable escalations without making caregiving feel robotic.",
    targetUsers: ["Home care agency owners", "Care coordinators", "Family caregivers"],
    serviceBusinessIdeas: [
      "Remote adherence monitoring service for home care agencies",
      "Care-quality reporting service for agencies selling to premium families",
      "Medication routine coaching service layered onto caregiver networks"
    ],
    physicalProductIdeas: [
      "Smart blister-pack scanner with simple caregiver tap logging",
      "NFC medication caddy that records dose events by slot",
      "Hydration reminder puck with agency-facing adherence dashboard"
    ],
    recommendationFor: ["Founder", "Investor"]
  },
  {
    id: "field-service-parts-mismatch",
    title: "Appliance and HVAC service companies waste same-day jobs because technicians arrive with the wrong parts",
    description:
      "Dispatch teams send technicians into the field with incomplete diagnostics and poor vehicle inventory visibility, so first-time fix rates stay low and profitable jobs spill into repeat visits.",
    affectedUsers: "Field service operators, dispatch teams, technicians, and homeowners",
    sector: "Field Services",
    realWorldContext:
      "The pain happens between the call center, dispatch board, technician van, customer site, and regional parts room where decisions must be made quickly.",
    severity: "High",
    demandScore: 90,
    monetizationScore: 91,
    difficultyScore: 54,
    competitionScore: 46,
    buildynexScore: 91,
    aiExplanation:
      "The buyer pain is direct and financial: repeat visits destroy margin and customer trust. A focused product that improves first-time fix rates can command strong willingness-to-pay.",
    opportunityTag: "Infrastructure Gap",
    whyItExists:
      "Most field service software schedules jobs well enough, but it does not connect symptom capture, likely failure diagnosis, and actual van stock into one decision loop.",
    painPoints: [
      "Technicians burn hours returning for parts that could have been predicted",
      "Dispatchers guess which truck should take which job",
      "Customers lose trust after missing work windows for repeat visits",
      "Parts rooms stay overstocked in the wrong SKUs and understocked in the right ones"
    ],
    marketNeedSummary:
      "Service operators want a better first-time-fix system that slots into dispatch workflows and avoids a full platform replacement.",
    targetUsers: ["HVAC service owners", "Appliance repair operators", "Dispatch managers"],
    serviceBusinessIdeas: [
      "First-time-fix optimization service for regional field service chains",
      "Diagnostic intake outsourcing service for after-hours call centers",
      "Parts forecasting and van-stock tuning service for service franchises"
    ],
    physicalProductIdeas: [
      "Technician van bin beacon system for live parts visibility",
      "Portable fault-diagnostic dock for appliance and HVAC symptom capture",
      "Scan-and-lock parts case that verifies job readiness before departure"
    ],
    recommendationFor: ["Founder", "Investor", "Student"]
  },
  {
    id: "auto-service-rework-control",
    title: "Independent garages lose profit on rework because inspection and torque steps are not verified in the bay",
    description:
      "Repair shops depend on technician memory and paper checklists for critical inspection steps, so comebacks and missed quality checks quietly erode margin and customer trust.",
    affectedUsers: "Garage owners, service advisors, technicians, and fleet customers",
    sector: "Auto Services",
    realWorldContext:
      "This problem appears inside repair bays, tool stations, wheel alignment zones, and handoff desks where rushed jobs make verification easy to skip.",
    severity: "Medium",
    demandScore: 84,
    monetizationScore: 86,
    difficultyScore: 49,
    competitionScore: 33,
    buildynexScore: 86,
    aiExplanation:
      "The opportunity is strong because quality failures are expensive and highly visible, while independent shops are underserved by modern workflow tooling built for bay operations.",
    opportunityTag: "White Space",
    whyItExists:
      "Most garage software focuses on invoicing and work orders, not whether critical physical repair steps were completed and documented correctly.",
    painPoints: [
      "Comebacks eat technician time and wipe out the margin on the original job",
      "Service advisors cannot prove quality checks were really done",
      "Fleet customers push for documentation that independent shops struggle to provide",
      "Shop owners spot repeat failure patterns only after reviews or warranty claims"
    ],
    marketNeedSummary:
      "Garages want a practical QA layer that improves bay discipline and customer confidence without slowing technicians down.",
    targetUsers: ["Independent garage owners", "Multi-bay service chains", "Fleet maintenance shops"],
    serviceBusinessIdeas: [
      "Garage quality-audit service for fleet-focused repair shops",
      "Operational excellence program for multi-location auto service brands",
      "Warranty-claim reduction service tied to bay-level quality reporting"
    ],
    physicalProductIdeas: [
      "Torque-capture smart socket or wrench attachment",
      "Bay inspection camera stand with guided check workflow",
      "Tagged technician tray that verifies tool-step completion"
    ],
    recommendationFor: ["Founder", "Investor"]
  },
  {
    id: "dental-sterilization-chain",
    title: "Dental clinics struggle to prove instrument sterilization chain-of-custody across fast patient turnover",
    description:
      "Instrument trays move quickly between treatment rooms, sterilization staff, and storage without a reliable digital chain, creating audit risk and lost productivity when clinics get busy.",
    affectedUsers: "Dental clinic owners, sterilization technicians, dentists, and compliance leads",
    sector: "Dental Care",
    realWorldContext:
      "The issue shows up between treatment rooms, tray prep stations, sterilization machines, and storage shelves where instrument status needs to be obvious at a glance.",
    severity: "Medium",
    demandScore: 82,
    monetizationScore: 83,
    difficultyScore: 57,
    competitionScore: 29,
    buildynexScore: 84,
    aiExplanation:
      "This is a sharp, compliance-backed operational problem with low noise and good defensibility. The strongest wedge is small-clinic workflow control rather than large hospital sterilization software.",
    opportunityTag: "Infrastructure Gap",
    whyItExists:
      "Many clinics still rely on color tape, verbal coordination, and batch-level logs that do not preserve tray-level traceability during busy patient schedules.",
    painPoints: [
      "Staff lose time confirming whether trays are ready and compliant",
      "Audit preparation becomes manual and stressful",
      "Instrument turnover slows down chair utilization",
      "Owners worry about risk exposure without clean proof trails"
    ],
    marketNeedSummary:
      "Dental groups want traceability and faster room readiness without the complexity or price of hospital-grade systems.",
    targetUsers: ["Dental clinic owners", "Sterilization leads", "Dental group operations managers"],
    serviceBusinessIdeas: [
      "Compliance readiness service for dental group operators",
      "Sterilization workflow improvement consulting for expanding clinics",
      "Audit-prep documentation service bundled with software reporting"
    ],
    physicalProductIdeas: [
      "Tray-level RFID or NFC sterilization tags",
      "Chairside scan pad that confirms instrument readiness before seating",
      "Compact sterilization chain-of-custody dock for multi-room clinics"
    ],
    recommendationFor: ["Founder", "Investor", "Student"]
  }
];

export const sectorOptions = [
  "Hospitality",
  "Food Service",
  "Home Care",
  "Field Services",
  "Auto Services",
  "Dental Care",
  "Healthcare",
  "Education",
  "Fintech",
  "Climate",
  "Logistics",
  "Real Estate",
  "Manufacturing",
  "Retail Operations",
  "Enterprise AI"
];

export const budgetOptions = ["Under $1k", "$1k - $10k", "$10k - $50k", "$50k+"];
export const experienceOptions = ["Beginner", "Intermediate", "Advanced"];
export const countryOptions = ["India", "United States", "United Kingdom", "UAE", "Singapore", "Remote / Global"];
