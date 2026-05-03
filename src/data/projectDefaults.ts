import type { Project } from '../types';

export const createNewProject = (): Project => ({
  id: Date.now().toString(),
  title: 'New Project',
  languageName: '',
  dialect: '',
  countryRegion: '',
  targetListeners: '',
  ministryPurpose: '',
  biblicalTheme: '',
  scriptureReferences: '',
  localChurchPartner: '',
  currentStage: 'Research',
  projectNotes: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  research: {
    localLanguageNames: '', isoCode: '', villages: '', literacyLevel: '', religiousBackground: '',
    culturalNotes: '', existingScripture: '', localVerification: '', communityContacts: '', wordListNotes: '',
    heartLanguageChecklist: {}
  },
  plan: {
    messagePurpose: '', audience: '', contentType: 'Bible story', scriptSource: '', scriptStatus: '',
    translationNotes: '', backTranslationNotes: '', theologicalReviewStatus: '', localChurchApproval: '',
    speakerList: '', helperList: '', equipmentChecklist: {}, recordingLocation: '', travelPlan: '', backupPlan: '', distributionPlan: ''
  },
  record: {
    sessionTitle: '', speaker: '', scriptSection: '', recordingLocation: '', recordingNotes: '', retakeNotes: '',
    bestTakeMarker: '', noiseNotes: '', equipmentChecklist: {}
  },
  program: {
    programTitle: '', programNumber: '', tracks: [], exportNotes: ''
  },
  submit: {
    submissionChecklist: {}, submittedTo: '', submissionDate: '', submissionStatus: 'Not Submitted', reviewerNotes: ''
  },
  share: {
    targetListeners: '', localChurches: '', localBelievers: '', missionaries: '', communityLeaders: '', sharingMethod: '',
    offlineSharingMethod: '', onlineSharingLink: '', sdCardPlan: '', bluetoothPlan: '', whatsappPlan: '', radioPlan: '',
    evangelismUse: '', discipleshipUse: '', churchPlanting: '', childrensMinistry: '', womensMinistry: '', followUpContact: '',
    testimonyNotes: '', feedbackNotes: '', sharingChecklist: {}
  }
});
