export type HexagramLineData = {
  solid: boolean;
  active?: boolean;
};

export type TrigramData = {
  name: string;
  element: string;
};

export type HexagramCardData = {
  label: string;
  name: string;
  symbol: string;
  top: TrigramData;
  bottom: TrigramData;
  lines: HexagramLineData[];
};

export type SourceVectorData = {
  label: string;
  value: string;
  tone: 'orange' | 'blue' | 'purple';
};

export type ModuleOneData = {
  title: string;
  subtitle: string;
  sources: SourceVectorData[];
  cards: HexagramCardData[];
};

export type RoleFactorCardData = {
  role: string;
  roleDescription: string;
  symbol: string;
  element: string;
  factorLabel: string;
};

export type DynamicCatalystData = {
  label: string;
  value: string;
};

export type InterpretationBlockData = {
  title: string;
  description: string;
};

export type ModuleTwoData = {
  title: string;
  subtitle: string;
  body: RoleFactorCardData;
  application: RoleFactorCardData;
  formulaEyebrow: string;
  formulaTitle: string;
  formulaQuote: string;
  catalyst: DynamicCatalystData;
  interpretation: InterpretationBlockData[];
};

export type ModuleThreeVerdictTone = 'rose' | 'amber' | 'emerald' | 'slate';

export type MacroAnalysisData = {
  heading: string;
  content: string;
};

export type TacticStepData = {
  index: string;
  text: string;
  actionLabel: string;
};

export type InfoCardData = {
  title: string;
  body: string;
  badge?: string;
};

export type ModuleThreeData = {
  title: string;
  subtitle: string;
  verdictLabel: string;
  verdictTone: ModuleThreeVerdictTone;
  summaryQuote: string;
  macroAnalysis: MacroAnalysisData;
  tacticsHeading: string;
  tactics: TacticStepData[];
  infoCards: InfoCardData[];
};

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
  created_at?: string;
};

export type ModuleFourData = {
  divinationId: string;
  sessionId: string;
  inputPlaceholder: string;
  welcomeMessages: string[];
  initialMessages?: ChatMessage[];
};

export type DetailScreenData = {
  moduleOne: ModuleOneData;
  moduleTwo: ModuleTwoData;
  moduleThree: ModuleThreeData;
  moduleFour: ModuleFourData;
};
