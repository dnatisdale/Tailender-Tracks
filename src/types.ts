export type Stage = 'Research' | 'Plan' | 'Record' | 'Program' | 'Submit' | 'Share';

export interface Project {
  id: string;
  title: string;
  languageName: string;
  dialect: string;
  countryRegion: string;
  targetListeners: string;
  ministryPurpose: string;
  biblicalTheme: string;
  scriptureReferences: string;
  localChurchPartner: string;
  currentStage: Stage;
  projectNotes: string;
  createdAt: number;
  updatedAt: number;

  research: Record<string, any>;
  plan: Record<string, any>;
  record: Record<string, any>;
  program: Record<string, any>;
  submit: Record<string, any>;
  share: Record<string, any>;
}

export type FormGuide = {
  stage: Stage | 'After Share';
  title: string;
  purpose: string;
  useWhen: string;
  keyFields: string[];
  fieldTip: string;
};
