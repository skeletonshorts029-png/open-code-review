export type UserRole = "Student" | "Founder" | "Investor";
export type SeverityLevel = "High" | "Medium" | "Emerging";
export type OpportunityTag = "White Space" | "Infrastructure Gap" | "Behavior Shift" | "Fast-Growth";
export type ProjectStatus = "Discovery" | "Planning" | "Validating" | "Building" | "Launch Ready";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  profileImage?: string;
  role?: UserRole;
  sector?: string;
  budget?: string;
  country?: string;
  experienceLevel?: string;
  goals?: string;
  onboardingComplete: boolean;
  createdAt?: string;
  educationLevel?: string;
  skills?: string[];
  interests?: string[];
  availableTime?: string;
  startupStage?: string;
  teamSize?: string;
  existingIdea?: string;
  revenueStatus?: string;
  ticketSize?: string;
  preferredSectors?: string[];
  riskLevel?: string;
  preferredRegion?: string;
  notifications?: {
    weeklyDigest: boolean;
    productUpdates: boolean;
    dealAlerts: boolean;
  };
  theme?: "dark" | "light" | "system";
}

export interface ProblemRecord {
  id: string;
  title: string;
  description: string;
  affectedUsers: string;
  sector: string;
  realWorldContext: string;
  painLevel?: number;
  frequency?: string;
  willingnessToPay?: "Low" | "Medium" | "High";
  severity: SeverityLevel;
  demandScore: number;
  monetizationScore: number;
  difficultyScore: number;
  competitionScore: number;
  buildynexScore: number;
  aiExplanation: string;
  existingSolutions?: string;
  gapOpportunity?: string;
  aiSolutionPotential?: string;
  opportunityTag: OpportunityTag;
  whyItExists: string;
  painPoints: string[];
  marketNeedSummary: string;
  targetUsers: string[];
  serviceBusinessIdeas: string[];
  physicalProductIdeas: string[];
  recommendationFor: UserRole[];
}

export interface RoadmapStep {
  phase: string;
  duration: string;
  status: "Ready" | "In Progress" | "Up Next";
  ownerLens: string;
  focus?: string;
  successMetric?: string;
  keyRisk?: string;
  outputs: string[];
  completedByUser?: boolean;
  startedAt?: string;
  completedAt?: string;
  timeSpentHours?: number;
  experienceSummary?: string;
  keyFindings?: string;
  blockersNotes?: string;
  proofPoints?: string[];
  reviewScore?: number;
  reviewVerdict?: string;
  reviewSummary?: string;
  reviewStrengths?: string[];
  reviewConcerns?: string[];
  reviewNextActions?: string[];
}

export interface SolutionData {
  headline: string;
  summary: string;
  sections: Array<{
    title: string;
    points: string[];
  }>;
}

export interface BrandingData {
  nameIdeas: string[];
  taglineIdeas: string[];
  positioning: string;
  logoPrompt: string;
  colorPalette: string[];
  typography: string;
  personality: string[];
}

export interface LogoConceptRecord {
  id: string;
  title: string;
  subtitle: string;
  rationale: string;
  generationPrompt: string;
  svgMarkup: string;
  sourceModel?: string;
  qualityScore?: number;
}

export interface GoalProgressPoint {
  label: string;
  progress: number;
  done: boolean;
}

export interface GoalProgressData {
  overallCompletion: number;
  milestoneSummary: string;
  completedItems: string[];
  inProgressItems: string[];
  upcomingItems: string[];
  timeSeries: GoalProgressPoint[];
}

export interface WebsiteScoreData {
  overallScore: number;
  messagingScore: number;
  trustScore: number;
  conversionScore: number;
  uxScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  nextActions: string[];
}

export interface GeneratedProjectBundle {
  solutionData: SolutionData;
  roadmapData: RoadmapStep[];
  brandingData: BrandingData;
}

export interface ProjectRecord {
  id?: string;
  userId: string;
  projectName: string;
  selectedProblemId: string;
  selectedProblemTitle: string;
  sector: string;
  role: UserRole;
  solutionData: SolutionData;
  roadmapData: RoadmapStep[];
  brandingData: BrandingData;
  progressStatus: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedProblemRecord {
  id?: string;
  userId: string;
  problemId: string;
  savedAt?: string;
}
