import { useState, useEffect } from 'react';
import { 
  Home, Folder, Settings, BookOpen, ChevronLeft, ChevronDown, Plus, Save, Play,
  Download, CheckCircle, Search, Edit3, Mic, CheckSquare, FileText,
  Share2, Sun, Moon, User, X, Languages, Type, Volume2, VolumeX
} from 'lucide-react';
import { 
  askTailenderToshi, 
  getTailenderToshiCategories, 
  getSuggestedToshiQuestions,
  getToshiBrainStats 
} from './data/tailenderToshiBrain';
import './index.css';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

type Stage = 'Research' | 'Plan' | 'Record' | 'Program' | 'Submit' | 'Share';

interface Project {
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

const createNewProject = (): Project => ({
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

// ==========================================
// GENERIC COMPONENTS
// ==========================================

const FieldInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="input-group">
    <label>{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const FieldTextarea = ({ label, value, onChange, placeholder = "" }: any) => (
  <div className="input-group">
    <label>{label}</label>
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const FieldCheckbox = ({ label, checked, onChange }: any) => (
  <label className="checkbox-label">
    <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);

const FieldSelect = ({ label, value, onChange, options }: any) => (
  <div className="input-group">
    <label>{label}</label>
    <select value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">Select...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);


type FormGuide = {
  stage: Stage | 'After Share';
  title: string;
  purpose: string;
  useWhen: string;
  keyFields: string[];
  fieldTip: string;
};

const FORM_GUIDES: FormGuide[] = [
  {
    stage: 'Research',
    title: 'Language & Community Profile',
    purpose: 'Confirm the language, community, and audience before recording.',
    useWhen: 'Use this before you plan the script so the team knows the right heart language, location, and listener group.',
    keyFields: ['Project title', 'Language name', 'Local language names', 'Dialect / speech variety', 'ISO code if known', 'People group / community name', 'Country / region / villages', 'Target listeners', 'Literacy level', 'Religious background notes', 'Cultural notes', 'Existing Scripture/audio resources', 'Local verification notes', 'Community contacts', 'Word-list notes'],
    fieldTip: 'Do not guess the language name. Verify it with mother-tongue speakers and local church/community contacts.'
  },
  {
    stage: 'Plan',
    title: 'Recording Project Plan',
    purpose: 'Prepare the ministry purpose, content, people, equipment, location, and distribution plan.',
    useWhen: 'Use this before recording day so the team is not scrambling at the last minute.',
    keyFields: ['Ministry purpose', 'Target listeners', 'Content type', 'Biblical theme', 'Scripture references', 'Script source/status', 'Translation notes', 'Back-translation notes', 'Theological review status', 'Local church / partner approval', 'Speaker list', 'Helper list', 'Recording location', 'Equipment checklist', 'Backup plan', 'Distribution plan'],
    fieldTip: 'A good plan protects the speaker, the reviewer, and the final listeners.'
  },
  {
    stage: 'Plan',
    title: 'Speaker & Helper Consent Form',
    purpose: 'Document permission from speakers, singers, translators, checkers, reviewers, helpers, or guides.',
    useWhen: 'Use this before or during recording whenever someone gives voice, translation, checking, music, or field help.',
    keyFields: ['Person name or nickname', 'Role', 'Language / dialect', 'Village / community', 'Consent to record voice', 'Consent to share locally', 'Consent to share online', 'Consent to use name/photo if applicable', 'Restrictions or concerns', 'Date consent was given', 'Consent confirmed by', 'Witness/team member'],
    fieldTip: 'If someone has restrictions, write them clearly before the recording is shared.'
  },
  {
    stage: 'Plan',
    title: 'Script & Content Approval Form',
    purpose: 'Track script source, translation, back-translation, theological review, local review, and approval.',
    useWhen: 'Use this when a message, story, lesson, testimony, or song needs approval before recording or publishing.',
    keyFields: ['Script title', 'Content type', 'Source of script', 'Original language', 'Target language', 'Biblical references', 'Translator / adapter', 'Back-translator', 'Theological reviewer', 'Local reviewer', 'Cultural concerns', 'Sensitive words or concepts', 'Approval status', 'Approval date', 'Approved by', 'Reviewer notes'],
    fieldTip: 'Keep review notes with the project so future teams know why decisions were made.'
  },
  {
    stage: 'Plan',
    title: 'Rights & Permissions Form',
    purpose: 'Track permission for scripts, songs, music, translations, and other content.',
    useWhen: 'Use this before using any content the team did not fully create themselves.',
    keyFields: ['Content title', 'Content source', 'Author / creator', 'Translator / adapter', 'Music owner', 'Song owner', 'Permission needed', 'Permission received', 'Allowed uses', 'Restrictions', 'Permission document or note', 'Permission date', 'Permission confirmed by'],
    fieldTip: 'When in doubt, mark permission as unknown until someone verifies it.'
  },
  {
    stage: 'Record',
    title: 'Recording Session Log',
    purpose: 'Capture session details, takes, technical notes, playback checks, and backup status.',
    useWhen: 'Use this during recording day so the editor can find the best takes and understand any problems.',
    keyFields: ['Session title', 'Project', 'Date', 'Location', 'Recorder operator', 'Speaker / singer / helper', 'Script section', 'Equipment used', 'Microphone used', 'Room tone captured', 'Test recording completed', 'Battery/storage/headphones checked', 'File names', 'Take numbers', 'Best take', 'Retake notes', 'Noise notes', 'Problems encountered', 'Playback check completed', 'Backup made'],
    fieldTip: 'Write down file names and best takes immediately. Memory gets fuzzy after a long recording day.'
  },
  {
    stage: 'Program',
    title: 'Audio Program Form',
    purpose: 'Organize final track order, titles, speakers, script names, duration, and final program notes.',
    useWhen: 'Use this when the recordings are becoming a finished program or package.',
    keyFields: ['Program title', 'Project', 'Language / dialect', 'Program number', 'Target listeners', 'Program purpose', 'Scripture references', 'Track order', 'Track titles', 'Speaker / singer', 'Script names', 'Duration notes', 'Intro/outro notes', 'Music/song notes', 'Missing information warnings', 'Smart file naming preview', 'Final program notes'],
    fieldTip: 'Track order and titles should be clear enough that a reviewer can understand the whole program quickly.'
  },
  {
    stage: 'Submit',
    title: 'Submission Package Checklist',
    purpose: 'Confirm the recording package is complete before sending it to a reviewer, media team, database, studio, or ministry office.',
    useWhen: 'Use this right before submission so nothing important is missing.',
    keyFields: ['Audio files included', 'Original recordings if needed', 'Edited files included', 'Scripts included', 'Translations included', 'Back-translations included', 'Consent forms complete', 'Permissions complete', 'Theological review complete', 'Local partner approval complete', 'Program form complete', 'Tracklist complete', 'Metadata complete', 'File names checked', 'Backup complete', 'Package ZIP created', 'Submitted to', 'Submission date/status', 'Reviewer notes', 'Follow-up actions'],
    fieldTip: 'This is the final “did we forget anything?” check before handing it off.'
  },
  {
    stage: 'Share',
    title: 'Sharing & Distribution Plan',
    purpose: 'Plan how the finished message will reach listeners, churches, field workers, and communities.',
    useWhen: 'Use this before distribution so the team knows who will receive the recordings and how follow-up will happen.',
    keyFields: ['Target listeners', 'Local churches', 'Local believers', 'Missionaries / field workers', 'Community leaders', 'Online sharing link', 'QR code/link', 'Offline sharing method', 'SD card plan', 'Bluetooth sharing plan', 'WhatsApp / Signal / Telegram plan', 'Radio plan', 'Speaker box / listening group plan', 'Planned ministry uses', 'Follow-up contact', 'Testimony / response notes', 'Feedback notes'],
    fieldTip: 'Sharing is not just delivery. Plan the follow-up person too.'
  },
  {
    stage: 'After Share',
    title: 'Field Feedback Form',
    purpose: 'Collect listener response, understandability, cultural clarity, concerns, testimonies, and follow-up actions.',
    useWhen: 'Use this after people listen so the team learns what helped, what confused people, and what needs fixing.',
    keyFields: ['Where the recording was shared', 'Who listened', 'Approximate number of listeners', 'Feedback collected by', 'Feedback date', 'How people responded', 'Was the language understandable?', 'Was the content culturally clear?', 'Objections or concerns', 'Testimonies', 'Questions people asked', 'Requests for more content', 'Needed corrections', 'Follow-up actions'],
    fieldTip: 'Feedback helps the next recording become clearer and more useful.'
  }
];

const getFormGuide = (title: string) => FORM_GUIDES.find(f => f.title === title);

// ==========================================
// VIEWS
// ==========================================

const Modal = ({ title, onClose, children }: any) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
  }}>
    <div className="card" style={{ width: '100%', maxWidth: 400, margin: 0, position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
        <X size={20} />
      </button>
      <h3 className="card-title" style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  </div>
);

function StageForms({ stage, forms }: any) {
  const stageForms = forms.filter((f: any) => f.stage === stage);
  if (stageForms.length === 0) return null;
  return (
    <div className="card forms-card">
      <h3 className="card-title"><FileText size={18} /> Required Forms for {stage}</h3>
      <p className="card-help">Open the matching fillable PDF, then use the checklist below so you know what each form is for.</p>
      <div className="form-link-list">
        {stageForms.map((f: any, i: number) => {
          const guide = getFormGuide(f.title);
          return (
            <div key={i} className="form-guide-card">
              <div className="form-guide-topline">
                <div>
                  <h4>{f.title}</h4>
                  {guide && <p>{guide.purpose}</p>}
                </div>
                <a href={f.file} target="_blank" rel="noopener noreferrer" className="btn form-open-btn">
                  <FileText size={18} /> Open PDF
                </a>
              </div>
              {guide && (
                <>
                  <div className="form-tip"><strong>When to use:</strong> {guide.useWhen}</div>
                  <details className="form-fields-details">
                    <summary>Show key fields</summary>
                    <ul>
                      {guide.keyFields.map(field => <li key={field}>{field}</li>)}
                    </ul>
                  </details>
                  <div className="form-tip"><strong>Toshi tip:</strong> {guide.fieldTip}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeView({ projects, onOpenProject, onCreateProject, goView }: any) {
  const recentProject = projects.length > 0 ? [...projects].sort((a,b) => b.updatedAt - a.updatedAt)[0] : null;

  return (
    <div>
      <div className="view-header">
        <h1>Welcome</h1>
        <p>Offline field recording workflow</p>
      </div>

      <button className="btn btn-primary" onClick={onCreateProject} style={{ marginBottom: 24, padding: 16 }}>
        <Plus size={20} /> Create New Project
      </button>

      {recentProject && (
        <div className="card" onClick={() => onOpenProject(recentProject.id)} style={{ cursor: 'pointer' }}>
          <h3 className="card-title"><Play size={18} /> Continue Last Project</h3>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{recentProject.title}</div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
            Stage: <span className="badge active">{recentProject.currentStage}</span>
          </p>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">Today's Next Steps</h3>
        <div className="list-item" onClick={() => goView('Projects')}>
          <div className="list-item-content">
            <h4>Review Active Projects</h4>
            <p>You have {projects.length} active projects</p>
          </div>
          <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--text-secondary)' }} />
        </div>
        <div className="list-item" onClick={() => goView('Training')}>
          <div className="list-item-content">
            <h4>Check Training Guide</h4>
            <p>Review the 6-stage workflow</p>
          </div>
          <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--text-secondary)' }} />
        </div>
        <div className="list-item" onClick={() => goView('Forms')}>
          <div className="list-item-content">
            <h4>Open Forms Library</h4>
            <p>Use the fillable PDF forms for each workflow stage</p>
          </div>
          <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--text-secondary)' }} />
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          App is ready for offline use
        </p>
      </div>
    </div>
  );
}

function ProjectsView({ projects, onOpenProject, onCreateProject }: any) {
  const [search, setSearch] = useState('');
  
  const filtered = projects.filter((p: Project) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.languageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="view-header">
        <h1>Projects</h1>
        <p>Manage your recording programs</p>
      </div>

      <div className="input-group">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search projects or languages..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
      </div>

      <button className="btn" onClick={onCreateProject}>
        <Plus size={18} /> New Project
      </button>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
        ) : (
          filtered.map((p: Project) => (
            <div key={p.id} className="card" onClick={() => onOpenProject(p.id)} style={{ cursor: 'pointer', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.languageName || 'No Language'} • {new Date(p.updatedAt).toLocaleDateString()}</div>
                </div>
                <div className="badge active">{p.currentStage}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProjectDetailView({ project, updateProject, goStage, onSave }: any) {
  const [showSaved, setShowSaved] = useState(false);
  if(!project) return null;
  const stages: Stage[] = ['Research', 'Plan', 'Record', 'Program', 'Submit', 'Share'];

  const handleSave = () => {
    onSave();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="card-title" style={{ margin: 0 }}><Edit3 size={18} /> Project Summary</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {showSaved && <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', animation: 'fadeIn 0.3s' }}>Saved!</span>}
            <button className="btn btn-primary" onClick={handleSave} style={{ width: 'auto', margin: 0 }}>
              <Save size={16} /> Save Project
            </button>
          </div>
        </div>
        <FieldInput label="Project Title" value={project.title} onChange={(v:any) => updateProject({title: v})} />
        <FieldInput label="Language Name" value={project.languageName} onChange={(v:any) => updateProject({languageName: v})} />
        <FieldInput label="Dialect / Speech Variety" value={project.dialect} onChange={(v:any) => updateProject({dialect: v})} />
        <FieldInput label="Country / Region" value={project.countryRegion} onChange={(v:any) => updateProject({countryRegion: v})} />
        <FieldInput label="Target Listeners" value={project.targetListeners} onChange={(v:any) => updateProject({targetListeners: v})} />
        <FieldInput label="Ministry Purpose" value={project.ministryPurpose} onChange={(v:any) => updateProject({ministryPurpose: v})} />
        <FieldInput label="Biblical Theme" value={project.biblicalTheme} onChange={(v:any) => updateProject({biblicalTheme: v})} />
        <FieldInput label="Scripture References" value={project.scriptureReferences} onChange={(v:any) => updateProject({scriptureReferences: v})} />
        <FieldInput label="Local Church / Partner" value={project.localChurchPartner} onChange={(v:any) => updateProject({localChurchPartner: v})} />
        <FieldTextarea label="Project Notes" value={project.projectNotes} onChange={(v:any) => updateProject({projectNotes: v})} />
      </div>

      <div className="card">
        <h3 className="card-title">Workflow Stages</h3>
        <div className="stage-grid">
          {stages.map(s => (
            <div key={s} className={`stage-card ${project.currentStage === s ? 'active' : ''}`} onClick={() => {
              updateProject({currentStage: s});
              goStage(s);
            }}>
              <div>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// STAGE: RESEARCH
function StageResearch({ project, update, formsManifest }: any) {
  const d = project.research || {};
  const cb = d.heartLanguageChecklist || {};
  const setD = (k: string, v: any) => update('research', k, v);
  const setCb = (k: string, v: boolean) => update('research', 'heartLanguageChecklist', { ...cb, [k]: v });

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)' }}>Confirm you are recording the right message for the right people in the right heart language.</p>
      
      <StageForms stage="Research" forms={formsManifest} />

      <div className="card">
        <h3 className="card-title">Language Context</h3>
        <FieldInput label="Local Language Names" value={d.localLanguageNames} onChange={(v:any) => setD('localLanguageNames', v)} />
        <FieldInput label="ISO Code" value={d.isoCode} onChange={(v:any) => setD('isoCode', v)} />
        <FieldInput label="Villages / Regions" value={d.villages} onChange={(v:any) => setD('villages', v)} />
        <FieldInput label="Literacy Level" value={d.literacyLevel} onChange={(v:any) => setD('literacyLevel', v)} />
        <FieldTextarea label="Religious Background Notes" value={d.religiousBackground} onChange={(v:any) => setD('religiousBackground', v)} />
        <FieldTextarea label="Cultural Notes" value={d.culturalNotes} onChange={(v:any) => setD('culturalNotes', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Field Research</h3>
        <FieldTextarea label="Existing Scripture/Recordings" value={d.existingScripture} onChange={(v:any) => setD('existingScripture', v)} />
        <FieldTextarea label="Local Verification Notes" value={d.localVerification} onChange={(v:any) => setD('localVerification', v)} />
        <FieldTextarea label="Community Contacts" value={d.communityContacts} onChange={(v:any) => setD('communityContacts', v)} />
        <FieldTextarea label="Word-List Recording Notes" value={d.wordListNotes} onChange={(v:any) => setD('wordListNotes', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Heart-Language Check</h3>
        <FieldCheckbox label="Verified name with mother-tongue speakers" checked={cb.c1} onChange={(v:any) => setCb('c1', v)} />
        <FieldCheckbox label="Confirmed no suitable existing recordings" checked={cb.c2} onChange={(v:any) => setCb('c2', v)} />
        <FieldCheckbox label="Consulted local church leaders" checked={cb.c3} onChange={(v:any) => setCb('c3', v)} />
        <FieldCheckbox label="Word list collected if needed" checked={cb.c4} onChange={(v:any) => setCb('c4', v)} />
      </div>
    </div>
  );
}

// STAGE: PLAN
function StagePlan({ project, update, formsManifest }: any) {
  const d = project.plan || {};
  const setD = (k: string, v: any) => update('plan', k, v);

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)' }}>Prepare properly before recording day.</p>
      
      <StageForms stage="Plan" forms={formsManifest} />

      <div className="card">
        <h3 className="card-title">Content Plan</h3>
        <FieldInput label="Message Purpose" value={d.messagePurpose} onChange={(v:any) => setD('messagePurpose', v)} />
        <FieldInput label="Audience" value={d.audience} onChange={(v:any) => setD('audience', v)} />
        <FieldSelect label="Content Type" value={d.contentType} onChange={(v:any) => setD('contentType', v)} 
          options={['Bible story', 'Gospel message', 'Testimony', 'Song/Worship', 'Discipleship lesson', "Children's lesson", 'Health/Help message']} />
        <FieldInput label="Script Source" value={d.scriptSource} onChange={(v:any) => setD('scriptSource', v)} />
        <FieldSelect label="Script Status" value={d.scriptStatus} onChange={(v:any) => setD('scriptStatus', v)} 
          options={['Drafting', 'Translating', 'Reviewing', 'Ready to Record']} />
        <FieldTextarea label="Translation / Adaptation Notes" value={d.translationNotes} onChange={(v:any) => setD('translationNotes', v)} />
        <FieldTextarea label="Back-Translation Notes" value={d.backTranslationNotes} onChange={(v:any) => setD('backTranslationNotes', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Logistics & Approvals</h3>
        <FieldInput label="Theological Review Status" value={d.theologicalReviewStatus} onChange={(v:any) => setD('theologicalReviewStatus', v)} />
        <FieldInput label="Local Church / Partner Approval" value={d.localChurchApproval} onChange={(v:any) => setD('localChurchApproval', v)} />
        <FieldInput label="Speaker List" value={d.speakerList} onChange={(v:any) => setD('speakerList', v)} />
        <FieldInput label="Helper List" value={d.helperList} onChange={(v:any) => setD('helperList', v)} />
        <FieldInput label="Recording Location" value={d.recordingLocation} onChange={(v:any) => setD('recordingLocation', v)} />
        <FieldTextarea label="Travel Plan" value={d.travelPlan} onChange={(v:any) => setD('travelPlan', v)} />
        <FieldTextarea label="Backup Plan" value={d.backupPlan} onChange={(v:any) => setD('backupPlan', v)} />
        <FieldTextarea label="Distribution Plan" value={d.distributionPlan} onChange={(v:any) => setD('distributionPlan', v)} />
      </div>
    </div>
  );
}

// STAGE: RECORD
function StageRecord({ project, update, formsManifest }: any) {
  const d = project.record || {};
  const cb = d.equipmentChecklist || {};
  const setD = (k: string, v: any) => update('record', k, v);
  const setCb = (k: string, v: boolean) => update('record', 'equipmentChecklist', { ...cb, [k]: v });

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)' }}>Capture clean, usable audio.</p>
      
      <StageForms stage="Record" forms={formsManifest} />

      <div className="card" style={{ textAlign: 'center' }}>
        <Mic size={48} color="var(--accent-color)" style={{ marginBottom: 16 }} />
        <h3 style={{ margin: '0 0 16px 0' }}>Recording Session</h3>
        <FieldInput label="Session Title" value={d.sessionTitle} onChange={(v:any) => setD('sessionTitle', v)} />
        <FieldInput label="Speaker" value={d.speaker} onChange={(v:any) => setD('speaker', v)} />
        <FieldInput label="Script Section" value={d.scriptSection} onChange={(v:any) => setD('scriptSection', v)} />
        <FieldInput label="Recording Location" value={d.recordingLocation} onChange={(v:any) => setD('recordingLocation', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Recording Day Readiness</h3>
        <FieldCheckbox label="Batteries charged & spares ready" checked={cb.c1} onChange={(v:any) => setCb('c1', v)} />
        <FieldCheckbox label="Storage SD card ready/formatted" checked={cb.c2} onChange={(v:any) => setCb('c2', v)} />
        <FieldCheckbox label="Microphone tested" checked={cb.c3} onChange={(v:any) => setCb('c3', v)} />
        <FieldCheckbox label="Headphones tested" checked={cb.c4} onChange={(v:any) => setCb('c4', v)} />
        <FieldCheckbox label="Recorded Room Tone (30s)" checked={d.roomToneReminderChecked} onChange={(v:any) => setD('roomToneReminderChecked', v)} />
        <FieldCheckbox label="Test recording check done" checked={d.testRecordingReminderChecked} onChange={(v:any) => setD('testRecordingReminderChecked', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Session Notes</h3>
        <FieldTextarea label="Recording Notes" value={d.recordingNotes} onChange={(v:any) => setD('recordingNotes', v)} />
        <FieldTextarea label="Retake Notes" value={d.retakeNotes} onChange={(v:any) => setD('retakeNotes', v)} />
        <FieldInput label="Best Take Marker (Timecode/Filename)" value={d.bestTakeMarker} onChange={(v:any) => setD('bestTakeMarker', v)} />
        <FieldTextarea label="Noise / Interference Notes" value={d.noiseNotes} onChange={(v:any) => setD('noiseNotes', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Post-Session</h3>
        <FieldCheckbox label="Playback Check (Checked audio quality)" checked={d.playbackCheckChecked} onChange={(v:any) => setD('playbackCheckChecked', v)} />
        <FieldCheckbox label="Backup Made" checked={d.backupMadeChecked} onChange={(v:any) => setD('backupMadeChecked', v)} />
      </div>
    </div>
  );
}

// STAGE: PROGRAM
function StageProgram({ project, update, formsManifest }: any) {
  const d = project.program || {};
  const tracks = d.tracks || [];
  const setD = (k: string, v: any) => update('program', k, v);

  const addTrack = () => {
    const newTrack = { id: Date.now().toString(), title: 'New Track', speaker: '', scriptName: '', duration: '', introOutroNotes: '', songMusicNotes: '' };
    setD('tracks', [...tracks, newTrack]);
  };

  const updateTrack = (id: string, field: string, val: any) => {
    setD('tracks', tracks.map((t:any) => t.id === id ? { ...t, [field]: val } : t));
  };

  const moveTrack = (index: number, dir: number) => {
    const newIdx = index + dir;
    if(newIdx < 0 || newIdx >= tracks.length) return;
    const arr = [...tracks];
    const temp = arr[index];
    arr[index] = arr[newIdx];
    arr[newIdx] = temp;
    setD('tracks', arr);
  };

  const smartFileName = `${project.languageName.substring(0,3).toUpperCase()}_${d.programNumber || '001'}_${project.title.replace(/\s+/g,'_')}.zip`;

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)' }}>Organize the final audio program.</p>
      
      <StageForms stage="Program" forms={formsManifest} />

      <div className="card">
        <h3 className="card-title">Program Identity</h3>
        <FieldInput label="Program Title" value={d.programTitle} onChange={(v:any) => setD('programTitle', v)} />
        <FieldInput label="Program Number" value={d.programNumber} onChange={(v:any) => setD('programNumber', v)} />
        
        <div style={{ marginTop: 16, padding: 12, backgroundColor: 'var(--bg-color)', borderRadius: 8 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Smart File Naming Preview:</div>
          <code style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{smartFileName}</code>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>Track List</span>
          <button className="btn" style={{ padding: '4px 8px', width: 'auto', margin: 0 }} onClick={addTrack}><Plus size={16}/></button>
        </h3>

        {tracks.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No tracks added yet.</p>}

        {tracks.map((t:any, i:number) => (
          <div key={t.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: 'var(--bg-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <strong>Track {i + 1}</strong>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => moveTrack(i, -1)} disabled={i===0}>↑</button>
                <button onClick={() => moveTrack(i, 1)} disabled={i===tracks.length-1}>↓</button>
              </div>
            </div>
            <FieldInput label="Track Title" value={t.title} onChange={(v:any) => updateTrack(t.id, 'title', v)} />
            <FieldInput label="Speaker" value={t.speaker} onChange={(v:any) => updateTrack(t.id, 'speaker', v)} />
            <FieldInput label="Script Name" value={t.scriptName} onChange={(v:any) => updateTrack(t.id, 'scriptName', v)} />
            <FieldInput label="Duration" value={t.duration} onChange={(v:any) => updateTrack(t.id, 'duration', v)} placeholder="e.g. 03:45" />
            
            {(!t.title || !t.speaker || !t.duration) && (
              <p style={{ color: '#aa1111', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Warning: Missing basic information</p>
            )}
          </div>
        ))}
      </div>
      
      <button className="btn btn-primary" style={{ marginBottom: 24 }}>
        <Download size={18} /> Export Tracklist
      </button>
    </div>
  );
}

// STAGE: SUBMIT
function StageSubmit({ project, update, formsManifest }: any) {
  const d = project.submit || {};
  const cb = d.submissionChecklist || {};
  const setD = (k: string, v: any) => update('submit', k, v);
  const setCb = (k: string, v: boolean) => update('submit', 'submissionChecklist', { ...cb, [k]: v });

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)' }}>Send the finished recording package.</p>
      
      <StageForms stage="Submit" forms={formsManifest} />

      <div className="card">
        <h3 className="card-title">Submission Readiness Checklist</h3>
        <FieldCheckbox label="Audio files included" checked={cb.c1} onChange={(v:any) => setCb('c1', v)} />
        <FieldCheckbox label="Scripts included" checked={cb.c2} onChange={(v:any) => setCb('c2', v)} />
        <FieldCheckbox label="Forms complete" checked={cb.c3} onChange={(v:any) => setCb('c3', v)} />
        <FieldCheckbox label="Permissions included" checked={cb.c4} onChange={(v:any) => setCb('c4', v)} />
        <FieldCheckbox label="Theological review complete" checked={cb.c5} onChange={(v:any) => setCb('c5', v)} />
        <FieldCheckbox label="Local partner approval complete" checked={cb.c6} onChange={(v:any) => setCb('c6', v)} />
        <FieldCheckbox label="Tracklist complete" checked={cb.c7} onChange={(v:any) => setCb('c7', v)} />
        <FieldCheckbox label="Metadata complete" checked={cb.c8} onChange={(v:any) => setCb('c8', v)} />
        <FieldCheckbox label="Backup complete" checked={cb.c9} onChange={(v:any) => setCb('c9', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Package ZIP Preview</h3>
        <div style={{ textAlign: 'center', padding: '24px 0', border: '2px dashed var(--border-color)', borderRadius: 8 }}>
          <Folder size={32} color="var(--text-secondary)" style={{ marginBottom: 8 }} />
          <div><strong>{project.languageName.substring(0,3).toUpperCase()}_Package.zip</strong></div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ready to assemble from selected files.</p>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Submission Tracking</h3>
        <FieldInput label="Submitted To" value={d.submittedTo} onChange={(v:any) => setD('submittedTo', v)} placeholder="Organization, Database, Studio..." />
        <FieldInput type="date" label="Submission Date" value={d.submissionDate} onChange={(v:any) => setD('submissionDate', v)} />
        <FieldSelect label="Submission Status" value={d.submissionStatus} onChange={(v:any) => setD('submissionStatus', v)} 
          options={['Not Submitted', 'Preparing', 'Uploading', 'Submitted', 'Accepted', 'Requires Fixes']} />
        <FieldTextarea label="Reviewer Notes" value={d.reviewerNotes} onChange={(v:any) => setD('reviewerNotes', v)} />
      </div>
    </div>
  );
}

// STAGE: SHARE
function StageShare({ project, update, formsManifest }: any) {
  const d = project.share || {};
  const cb = d.sharingChecklist || {};
  const setD = (k: string, v: any) => update('share', k, v);
  const setCb = (k: string, v: boolean) => update('share', 'sharingChecklist', { ...cb, [k]: v });

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)' }}>Help the message actually reach listeners.</p>
      
      <StageForms stage="Share" forms={formsManifest} />

      <div className="card">
        <h3 className="card-title">Sharing Plan Checklist</h3>
        <FieldCheckbox label="Target listeners identified" checked={cb.c1} onChange={(v:any) => setCb('c1', v)} />
        <FieldCheckbox label="Local church partners engaged" checked={cb.c2} onChange={(v:any) => setCb('c2', v)} />
        <FieldCheckbox label="Distribution media purchased (SD/Flash)" checked={cb.c3} onChange={(v:any) => setCb('c3', v)} />
        <FieldCheckbox label="Follow-up contact assigned" checked={cb.c4} onChange={(v:any) => setCb('c4', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Sharing Network</h3>
        <FieldInput label="Target Listeners" value={d.targetListeners} onChange={(v:any) => setD('targetListeners', v)} />
        <FieldInput label="Local Churches" value={d.localChurches} onChange={(v:any) => setD('localChurches', v)} />
        <FieldInput label="Local Believers" value={d.localBelievers} onChange={(v:any) => setD('localBelievers', v)} />
        <FieldInput label="Missionaries / Field Workers" value={d.missionaries} onChange={(v:any) => setD('missionaries', v)} />
        <FieldInput label="Community Leaders" value={d.communityLeaders} onChange={(v:any) => setD('communityLeaders', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Distribution Methods</h3>
        <FieldInput label="Primary Sharing Method" value={d.sharingMethod} onChange={(v:any) => setD('sharingMethod', v)} />
        <FieldInput label="Offline Sharing Method" value={d.offlineSharingMethod} onChange={(v:any) => setD('offlineSharingMethod', v)} />
        <FieldInput label="Online Sharing Link" value={d.onlineSharingLink} onChange={(v:any) => setD('onlineSharingLink', v)} />
        
        <div style={{ textAlign: 'center', padding: '16px 0', border: '1px solid var(--border-color)', borderRadius: 8, margin: '16px 0' }}>
          <div style={{ width: 100, height: 100, backgroundColor: '#eee', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            QR Code Placeholder
          </div>
          <span style={{ fontSize: '0.8rem' }}>Scan to listen online</span>
        </div>

        <FieldTextarea label="SD Card / Memory Card Plan" value={d.sdCardPlan} onChange={(v:any) => setD('sdCardPlan', v)} />
        <FieldTextarea label="Bluetooth Sharing Plan" value={d.bluetoothPlan} onChange={(v:any) => setD('bluetoothPlan', v)} />
        <FieldTextarea label="WhatsApp / Telegram Plan" value={d.whatsappPlan} onChange={(v:any) => setD('whatsappPlan', v)} />
        <FieldTextarea label="Radio / Speaker / Listening Group Plan" value={d.radioPlan} onChange={(v:any) => setD('radioPlan', v)} />
      </div>

      <div className="card">
        <h3 className="card-title">Ministry Use & Follow-up</h3>
        <FieldTextarea label="Evangelism Use" value={d.evangelismUse} onChange={(v:any) => setD('evangelismUse', v)} />
        <FieldTextarea label="Discipleship Use" value={d.discipleshipUse} onChange={(v:any) => setD('discipleshipUse', v)} />
        <FieldTextarea label="Church Planting Support" value={d.churchPlanting} onChange={(v:any) => setD('churchPlanting', v)} />
        <FieldTextarea label="Children's Ministry Use" value={d.childrensMinistry} onChange={(v:any) => setD('childrensMinistry', v)} />
        <FieldTextarea label="Women's Ministry Use" value={d.womensMinistry} onChange={(v:any) => setD('womensMinistry', v)} />
        <FieldInput label="Follow-up Contact Person" value={d.followUpContact} onChange={(v:any) => setD('followUpContact', v)} />
        <FieldTextarea label="Testimony / Response Notes" value={d.testimonyNotes} onChange={(v:any) => setD('testimonyNotes', v)} />
        <FieldTextarea label="Feedback Notes" value={d.feedbackNotes} onChange={(v:any) => setD('feedbackNotes', v)} />
      </div>
    </div>
  );
}

// FORMS VIEW
function FormsView({ formsManifest }: any) {
  const stageOrder = ['Research', 'Plan', 'Record', 'Program', 'Submit', 'Share'];
  return (
    <div>
      <div className="view-header">
        <h1>Forms Library</h1>
        <p>Fillable forms and simple field instructions for the whole recording workflow</p>
      </div>

      <div className="card">
        <h3 className="card-title"><FileText size={18} /> Complete Forms Packet</h3>
        <p className="card-help">Use this if you want one combined PDF instead of opening each form one by one.</p>
        <a className="btn btn-primary" href={`${import.meta.env.BASE_URL}forms/Tailender_Tracks_Neutral_Fillable_Forms_Combined.pdf`} target="_blank" rel="noopener noreferrer">
          <Download size={18} /> Open Combined Fillable PDF
        </a>
      </div>

      {stageOrder.map(stage => {
        const formsForStage = formsManifest.filter((f: any) => f.stage === stage);
        const guideOnly = FORM_GUIDES.filter(g => g.stage === stage && !formsForStage.some((f: any) => f.title === g.title));
        return (
          <div className="card" key={stage}>
            <h3 className="card-title">{stage} Forms</h3>
            {formsForStage.length === 0 && <p className="card-help">No PDFs are linked for this stage yet.</p>}
            <div className="form-link-list">
              {formsForStage.map((f: any) => {
                const guide = getFormGuide(f.title);
                return (
                  <div className="form-guide-card" key={`${stage}-${f.title}`}>
                    <div className="form-guide-topline">
                      <div>
                        <h4>{f.title}</h4>
                        {guide && <p>{guide.purpose}</p>}
                      </div>
                      <a href={f.file} target="_blank" rel="noopener noreferrer" className="btn form-open-btn">
                        <FileText size={18} /> Open PDF
                      </a>
                    </div>
                    {guide && (
                      <>
                        <div className="form-tip"><strong>When to use:</strong> {guide.useWhen}</div>
                        <details className="form-fields-details">
                          <summary>Show key fields from this form</summary>
                          <ul>{guide.keyFields.map(field => <li key={field}>{field}</li>)}</ul>
                        </details>
                      </>
                    )}
                  </div>
                );
              })}
              {guideOnly.map(guide => (
                <div className="form-guide-card" key={`${stage}-${guide.title}`}>
                  <h4>{guide.title}</h4>
                  <p>{guide.purpose}</p>
                  <div className="form-tip"><strong>Note:</strong> This guide is included, but no separate PDF is currently linked for this stage.</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="card">
        <h3 className="card-title">After Share</h3>
        {FORM_GUIDES.filter(g => g.stage === 'After Share').map(guide => (
          <div className="form-guide-card" key={guide.title}>
            <h4>{guide.title}</h4>
            <p>{guide.purpose}</p>
            <div className="form-tip"><strong>When to use:</strong> {guide.useWhen}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// TRAINING VIEW
function TrainingView() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const trainingSections = [
    { 
      key: 'research',
      t: '1. Research', 
      s: 'Confirm people, place, and heart language.',
      p: 'Confirm the right people, place, and heart language.',
      l: 'How to use the Heart Language Checklist and verify ISO codes/dialects.',
      q: 'Who is the target group? What is their first language? Are there multiple dialects?',
      a: 'Interview a local person to find their "language of the heart."',
      c: 'You have a confirmed Language Name and a specific target audience.'
    },
    { 
      key: 'plan',
      t: '2. Plan', 
      s: 'Prepare scripts, speakers, and consent.',
      p: 'Prepare the message, people, forms, and recording day.',
      l: 'Script preparation, speaker selection, and obtaining Consent Forms.',
      q: 'Is the script translated correctly? Do we have a quiet place to record? Are speakers comfortable?',
      a: 'Draft a simple script and practice reading it with a teammate.',
      c: 'Script is ready, speakers are chosen, and a recording location is found.'
    },
    { 
      key: 'record',
      t: '3. Record', 
      s: 'Capture clean, usable original audio.',
      p: 'Capture clean, usable original audio.',
      l: 'Microphone technique, recorder settings, and monitoring audio with headphones.',
      q: 'Is the levels meter peaking? Do I hear wind or background noise? Are the batteries full?',
      a: 'Record 30 seconds of speech and listen for "pops" or background hums.',
      c: 'You have high-quality, undistorted audio files saved safely.'
    },
    { 
      key: 'program',
      t: '4. Program', 
      s: 'Edit, organize, and check the audio.',
      p: 'Edit, organize, name, and check the audio.',
      l: 'File naming conventions, basic editing (tops and tails), and sequence checking.',
      q: 'Are the files named correctly? Is the sequence logical? Are there long silences?',
      a: 'Rename a set of files according to the project standard.',
      c: 'The audio is clean, ordered, and properly named for distribution.'
    },
    { 
      key: 'submit',
      t: '5. Submit', 
      s: 'Bundle package for review and archive.',
      p: 'Send a complete package for review, publishing, or archiving.',
      l: 'How to bundle files, metadata, and consent forms for submission.',
      q: 'Are all forms attached? Is the metadata accurate? Who needs to receive this?',
      a: 'Practice filling out the Final Submission checklist.',
      c: 'The complete project package is delivered to the review team.'
    },
    { 
      key: 'share',
      t: '6. Share', 
      s: 'Help the message reach listeners wisely.',
      p: 'Help the message actually reach listeners wisely.',
      l: 'Bluetooth sharing, SD card copying, and using local audio players.',
      q: 'What is the safest way to share here? How will people listen? Is it easy to copy?',
      a: 'Practice sharing a file from one phone to another via Bluetooth.',
      c: 'The community has access to the recordings on their own devices.'
    }
  ];

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Training</h1>
        <p>Learn the 6-Stage Christian Workflow</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Team Roles</h3>
        <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--text-secondary)' }}>
          <li style={{ marginBottom: 8 }}><strong>Research lead:</strong> Verifies heart language.</li>
          <li style={{ marginBottom: 8 }}><strong>Script lead:</strong> Adapts & translates scripts.</li>
          <li style={{ marginBottom: 8 }}><strong>Speaker care:</strong> Supports local speakers.</li>
          <li style={{ marginBottom: 8 }}><strong>Recorder operator:</strong> Handles audio capture.</li>
          <li style={{ marginBottom: 8 }}><strong>Backup person:</strong> Manages SD cards and files.</li>
          <li style={{ marginBottom: 8 }}><strong>Editor:</strong> Cleans and tops/tails audio.</li>
          <li style={{ marginBottom: 8 }}><strong>Reviewer:</strong> Theology and language check.</li>
          <li style={{ marginBottom: 8 }}><strong>Submitter:</strong> Prepares the final package.</li>
          <li style={{ marginBottom: 8 }}><strong>Distribution lead:</strong> Shares the finished work.</li>
        </ul>
      </div>

      <div className="training-accordion">
        {trainingSections.map((section) => {
          const isOpen = !!openSections[section.key];
          return (
            <div key={section.key} className="training-accordion-card">
              <button 
                className="training-accordion-header" 
                onClick={() => toggleSection(section.key)}
                aria-expanded={isOpen}
              >
                <div>
                  <span className="training-accordion-title">{section.t}</span>
                  <span className="training-accordion-subtitle">{section.s}</span>
                </div>
                <ChevronDown className={`training-accordion-icon ${isOpen ? 'open' : ''}`} size={20} />
              </button>
              
              {isOpen && (
                <div className="training-accordion-body">
                  <h4>Purpose</h4>
                  <p>{section.p}</p>

                  <h4>What you learn</h4>
                  <p>{section.l}</p>

                  <div className="field-questions">
                    <h4>Field Questions</h4>
                    <p>{section.q}</p>
                  </div>

                  <h4>Training Activity</h4>
                  <p>{section.a}</p>

                  <div className="ready-check">
                    <h4>Ready to move on?</h4>
                    <p style={{ fontWeight: 600 }}>{section.c}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SETTINGS VIEW
function SettingsView({ deferredPrompt, onInstallClick, settings, updateSetting, dataHandlers }: any) {
  return (
    <div>
      <div className="view-header">
        <h1>Settings</h1>
        <p>App preferences and data management</p>
      </div>

      <div className="card">
        <h3 className="card-title">App Configuration</h3>
        <FieldInput label="App Name" value="Tailender Tracks" onChange={()=>{}} />
        <FieldInput 
          label="Ministry / Organization Name" 
          value={settings.orgName} 
          onChange={(v:string) => updateSetting('orgName', v)} 
          placeholder="Your Organization..." 
        />
        <FieldSelect 
          label="Default Country / Region" 
          value={settings.defaultRegion} 
          onChange={(v:string) => updateSetting('defaultRegion', v)} 
          options={['Global', 'Africa', 'Asia', 'Americas']} 
        />
        <div style={{ marginBottom: 12 }}>
          <FieldSelect 
            label="Interface Language" 
            value={settings.interfaceLanguage} 
            onChange={(v:string) => updateSetting('interfaceLanguage', v)} 
            options={['English', 'Thai']} 
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: -8 }}>
            More interface translation is coming later.
          </p>
        </div>
        <FieldCheckbox 
          label="Easy Read Mode" 
          checked={settings.fontStyle === 'easy'} 
          onChange={(checked: boolean) => updateSetting('fontStyle', checked ? 'easy' : 'default')} 
        />
      </div>

      <div className="card">
        <h3 className="card-title">Data &amp; Storage</h3>
        <button className="btn" onClick={dataHandlers.onStorage}><BookOpen size={18} /> Storage Manager</button>
        <button className="btn" onClick={dataHandlers.onExport}><Download size={18} /> Backup / Export Projects</button>
        <button className="btn" onClick={dataHandlers.onImport}><CheckSquare size={18} /> Import Project Backup</button>
      </div>

      <div className="card">
        <h3 className="card-title">Install App</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          Install Tailender Tracks so it can open like an app on this device for offline field recording access.
        </p>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={onInstallClick}>
          Install Tailender Tracks
        </button>
        {!deferredPrompt && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 12 }}>
            If the install button does not open a prompt, check Chrome DevTools &gt; Application &gt; Manifest.
          </p>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, opacity: 1.0 }}>
        <img src={`${import.meta.env.BASE_URL}icons/Boot3.png`} alt="Logo" style={{ height: 40 }} />
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem' }}>Tailender Tracks v1.0.0<br/>78 RPM Series</p>
      </div>
    </div>
  );
}

// ==========================================
// APP COMPONENT (ROUTER)
// ==========================================

export default function App() {
  const [formsManifest, setFormsManifest] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}forms/forms_manifest_for_pwa.json`)
      .then(r => r.json())
      .then(data => {
        // Prepend BASE_URL to the file paths inside the manifest so forms link correctly on GitHub Pages
        const mappedData = data.map((d: any) => ({
          ...d,
          file: d.file.startsWith('/') ? `${import.meta.env.BASE_URL}${d.file.slice(1)}` : d.file
        }));
        setFormsManifest(mappedData);
      })
      .catch(e => console.error("Could not load forms manifest", e));
  }, []);

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('tailender_projects_v2');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tailender_projects_v2', JSON.stringify(projects));
  }, [projects]);

  const [activeView, setActiveView] = useState('Home');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.body.classList.contains('dark-theme');
  });
  const [showToshiDialog, setShowToshiDialog] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Install is available from the browser menu once the PWA passes Chrome\'s install checks.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Install prompt result: ${outcome}`);

    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };
  const [showSignIn, setShowSignIn] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  
  const [fontStyle, setFontStyle] = useState(() => localStorage.getItem('tailender_font_style') || 'default');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('tailender_font_size') || 'medium');
  const [isHighContrast, setIsHighContrast] = useState(() => localStorage.getItem('tailender_high_contrast') === 'true');

  const [orgName, setOrgName] = useState(() => localStorage.getItem('tailender_org_name') || '');
  const [defaultRegion, setDefaultRegion] = useState(() => localStorage.getItem('tailender_default_region') || 'Global');
  const [interfaceLanguage, setInterfaceLanguage] = useState(() => localStorage.getItem('tailender_interface_language') || 'English');

  const [splashState, setSplashState] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    // Apply accessibility classes to body
    const body = document.body;
    body.classList.remove('app-font-default', 'app-font-easy', 'app-font-thai-english', 'app-easy-read');
    
    if (fontStyle === 'easy') {
      body.classList.add('app-easy-read');
    } else {
      body.classList.add(`app-font-${fontStyle}`);
    }

    body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    body.classList.add(`font-size-${fontSize}`);

    if (isHighContrast) body.classList.add('high-contrast');
    else body.classList.remove('high-contrast');

    localStorage.setItem('tailender_font_style', fontStyle);
    localStorage.setItem('tailender_font_size', fontSize);
    localStorage.setItem('tailender_high_contrast', String(isHighContrast));
    localStorage.setItem('tailender_org_name', orgName);
    localStorage.setItem('tailender_default_region', defaultRegion);
    localStorage.setItem('tailender_interface_language', interfaceLanguage);
  }, [fontStyle, fontSize, isHighContrast, orgName, defaultRegion, interfaceLanguage]);

  useEffect(() => {
    if (!showAccessibilityModal) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById("google_translate_element");
      if (!el) return;

      if (el.childElementCount === 0 && window.googleTranslateElementInit) {
        window.googleTranslateElementInit();
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [showAccessibilityModal]);

  // Toshi Chat State
  const [ToshiFilter, setToshiFilter] = useState('All');
  const [ToshiEasyEnglish, setToshiEasyEnglish] = useState<Record<number, boolean>>({});
  const stats = getToshiBrainStats();
  const [ToshiMessages, setToshiMessages] = useState<any[]>([
    { sender: 'Toshi', text: `Howdy! I am Tailender Toshi — your offline field recording guide. I have ${stats.total} items ready. Ask me anything about Research, Recording, Troubleshooting, Glossary terms, and more!` }
  ]);
  const [ToshiInput, setToshiInput] = useState('');

  const handleToshiAction = (action: string) => {
    setShowToshiDialog(false);
    if (action.toLowerCase().includes('heart-language') || action.toLowerCase().includes('consent') || action.toLowerCase().includes('form')) {
      setActiveView('Forms');
    } else if (action.toLowerCase().includes('note') || action.toLowerCase().includes('project') || action.toLowerCase().includes('mark')) {
      setActiveView('Projects');
    } else if (action.toLowerCase().includes('training') || action.toLowerCase().includes('card')) {
      setActiveView('Training');
    } else {
      // Default fallback
      setActiveView('Projects');
    }
  };

  const handleSendToshiMessage = (textToSubmit?: string) => {
    const text = typeof textToSubmit === 'string' ? textToSubmit : ToshiInput;
    if (!text.trim()) return;
    const newMsgs = [...ToshiMessages, { sender: 'user', text }];
    setToshiMessages(newMsgs);
    setToshiInput('');
    setTimeout(() => {
      const response = askTailenderToshi(text, { stage: ToshiFilter === 'All' ? '' : ToshiFilter, limit: 8 });
      setToshiMessages(prev => [...prev, {
        sender: 'Toshi',
        text: response.answer,
        easyEnglish: response.easyEnglish,
        actions: response.actions || response.suggestions,
        related: response.related
      }]);
    }, 600);
  };

  useEffect(() => {
    const timer1 = setTimeout(() => setSplashState('fading'), 1900);
    const timer2 = setTimeout(() => setSplashState('hidden'), 2600);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-theme');
      setIsDarkMode(false);
    } else {
      document.body.classList.add('dark-theme');
      setIsDarkMode(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tailender Tracks',
        text: 'Check out Tailender Tracks PWA!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tailender_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re: any) => {
        try {
          const imported = JSON.parse(re.target.result);
          if (Array.isArray(imported)) {
            setProjects(imported);
            alert('Projects imported successfully!');
          }
        } catch(err) {
          alert('Failed to import project backup. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleStorageManager = () => {
    const bytes = new Blob([JSON.stringify(projects)]).size;
    alert(`Storage Status:\n\nKey: tailender_projects_v2\nProjects: ${projects.length}\nEstimated Size: ${(bytes / 1024).toFixed(2)} KB\n\nLocal storage is restricted to this browser. Use Export for backups.`);
  };

  const saveProjectNow = () => {
    setProjects(prev => {
      const updated = activeProjectId 
        ? prev.map(p => p.id === activeProjectId ? { ...p, updatedAt: Date.now() } : p)
        : prev;
      localStorage.setItem('tailender_projects_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const currentProject = projects.find(p => p.id === activeProjectId);

  const handleCreateProject = () => {
    const p = createNewProject();
    setProjects([...projects, p]);
    setActiveProjectId(p.id);
    setActiveView('ProjectDetail');
  };

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    setActiveView('ProjectDetail');
  };

  const updateProjectLevel = (updates: Partial<Project>) => {
    if(!activeProjectId) return;
    setProjects(projects.map(p => p.id === activeProjectId ? { ...p, ...updates, updatedAt: Date.now() } : p));
  };

  const updateProjectSection = (section: keyof Project, field: string, value: any) => {
    if(!activeProjectId) return;
    setProjects(projects.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          [section]: {
            ...(p[section] as any),
            [field]: value
          },
          updatedAt: Date.now()
        };
      }
      return p;
    }));
  };

  // Nav helpers
  const goBack = () => {
    if (['Research', 'Plan', 'Record', 'Program', 'Submit', 'Share'].includes(activeView)) {
      setActiveView('ProjectDetail');
    } else {
      setActiveView('Home');
    }
  };

  const renderView = () => {
    if (activeView === 'Home') return <HomeView projects={projects} onOpenProject={handleOpenProject} onCreateProject={handleCreateProject} goView={setActiveView} />;
    if (activeView === 'Projects') return <ProjectsView projects={projects} onOpenProject={handleOpenProject} onCreateProject={handleCreateProject} />;
    if (activeView === 'Training') return <TrainingView />;
    if (activeView === 'Forms') return <FormsView formsManifest={formsManifest} />;
    if (activeView === 'Settings') return (
      <SettingsView 
        deferredPrompt={deferredPrompt} 
        onInstallClick={handleInstallClick} 
        settings={{ orgName, defaultRegion, interfaceLanguage, fontStyle }}
        updateSetting={(key: string, val: any) => {
          if (key === 'orgName') setOrgName(val);
          if (key === 'defaultRegion') setDefaultRegion(val);
          if (key === 'interfaceLanguage') setInterfaceLanguage(val);
          if (key === 'fontStyle') setFontStyle(val);
        }}
        dataHandlers={{
          onStorage: handleStorageManager,
          onExport: handleExport,
          onImport: handleImport
        }}
      />
    );
    
    // Project specific views
    if (!currentProject) return <div style={{padding: 24}}>Project not found.</div>;
    
    if (activeView === 'ProjectDetail') return <ProjectDetailView project={currentProject} updateProject={updateProjectLevel} goStage={setActiveView} onSave={saveProjectNow} />;
    if (activeView === 'Research') return <StageResearch project={currentProject} update={updateProjectSection} formsManifest={formsManifest} />;
    if (activeView === 'Plan') return <StagePlan project={currentProject} update={updateProjectSection} formsManifest={formsManifest} />;
    if (activeView === 'Record') return <StageRecord project={currentProject} update={updateProjectSection} formsManifest={formsManifest} />;
    if (activeView === 'Program') return <StageProgram project={currentProject} update={updateProjectSection} formsManifest={formsManifest} />;
    if (activeView === 'Submit') return <StageSubmit project={currentProject} update={updateProjectSection} formsManifest={formsManifest} />;
    if (activeView === 'Share') return <StageShare project={currentProject} update={updateProjectSection} formsManifest={formsManifest} />;
  };

  const isProjectView = ['ProjectDetail', 'Research', 'Plan', 'Record', 'Program', 'Submit', 'Share'].includes(activeView);

  return (
    <>
      {splashState !== 'hidden' && (
        <div className="splash-screen" style={{ opacity: splashState === 'fading' ? 0 : 1 }}>
          <img src={`${import.meta.env.BASE_URL}icons/Toshi-wave-record-in-back.png`} alt="Tailender Toshi" className="splash-logo" />
          <div className="dymo-label-stack splash-dymo">
            <img src={`${import.meta.env.BASE_URL}icons/DYMO-Black-TAILENDER.png`} alt="TAILENDER" className="dymo-label dymo-label--splash" />
            <img src={`${import.meta.env.BASE_URL}icons/DYMO-Red-TRACK.png`} alt="TRACK" className="dymo-label dymo-label--splash dymo-label--red" />
          </div>
        </div>
      )}
      <div className="app-container">
        {/* HEADER */}
        <header className="header">
          <div className="header-title">
            {isProjectView ? (
              <button className="icon-btn" onClick={goBack} style={{ marginRight: 8 }}>
                <ChevronLeft size={24} />
              </button>
            ) : (
              <img src={`${import.meta.env.BASE_URL}icons/HEADER4TOSHI-BOOTS.png`} alt="Tailender Toshi and Boots" className="header-hero-logo" />
            )}
            {!isProjectView && (
              <div className="header-dymo-stack">
                <img src={`${import.meta.env.BASE_URL}icons/DYMO-Black-TAILENDER.png`} alt="TAILENDER" className="header-dymo-label" />
                <img src={`${import.meta.env.BASE_URL}icons/DYMO-Red-TRACK.png`} alt="TRACK" className="header-dymo-label header-dymo-label--red" />
              </div>
            )}
            {isProjectView && (
              <span>{activeView === 'ProjectDetail' ? 'Project Details' : activeView}</span>
            )}
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={toggleDarkMode} title="Toggle Light/Dark">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn" onClick={handleShare} title="Share App">
              <Share2 size={20} />
            </button>
            <button className="icon-btn" onClick={() => setShowAccessibilityModal(true)} title="Accessibility Settings">
              <Type size={20} />
            </button>
            <button className="icon-btn" onClick={() => setShowSignIn(true)} title="Sign In">
              <User size={20} />
            </button>
          </div>
        </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* bottom NAV */}
      {showAccessibilityModal && (
        <div className="install-banner-overlay" onClick={() => setShowAccessibilityModal(false)}>
          <div className="install-banner" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="install-banner-content">
              <h3>Accessibility & Translation</h3>
              
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-secondary)' }}>FONT STYLE</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className={`btn ${fontStyle === 'default' ? 'btn-primary' : ''}`} onClick={() => setFontStyle('default')} style={{ width: 'auto' }}>Default</button>
                  <button className={`btn ${fontStyle === 'easy' ? 'btn-primary' : ''}`} onClick={() => setFontStyle('easy')} style={{ width: 'auto' }}>Easy Read</button>
                  <button className={`btn ${fontStyle === 'thaiEnglish' ? 'btn-primary' : ''}`} onClick={() => setFontStyle('thaiEnglish')} style={{ width: 'auto' }}>Thai / English</button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                  “Easy Read uses spacing and simple fonts to help struggling readers. Thai / English uses a font stack better suited for mixed Thai and English text.”
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-secondary)' }}>TEXT SIZE</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={`btn ${fontSize === 'small' ? 'btn-primary' : ''}`} onClick={() => setFontSize('small')} style={{ width: 'auto', flex: 1 }}>A-</button>
                  <button className={`btn ${fontSize === 'medium' ? 'btn-primary' : ''}`} onClick={() => setFontSize('medium')} style={{ width: 'auto', flex: 1 }}>A</button>
                  <button className={`btn ${fontSize === 'large' ? 'btn-primary' : ''}`} onClick={() => setFontSize('large')} style={{ width: 'auto', flex: 1 }}>A+</button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-secondary)' }}>HIGH CONTRAST</h4>
                <button className={`btn ${isHighContrast ? 'btn-primary' : ''}`} onClick={() => setIsHighContrast(!isHighContrast)} style={{ width: 'auto' }}>
                  {isHighContrast ? 'Turn Off' : 'Turn On'}
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-secondary)' }}>SCREEN READER</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={handleReadPage} style={{ width: 'auto', flex: 1 }}><Volume2 size={16} /> Read Page</button>
                  <button className="btn" onClick={handleStopReading} style={{ width: 'auto', flex: 1 }}><VolumeX size={16} /> Stop</button>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-secondary)' }}>GOOGLE TRANSLATE</h4>
                {!navigator.onLine ? (
                  <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', margin: 0 }}>
                    Google Translate needs internet access.
                  </p>
                ) : (
                  <>
                    <div className="translate-widget-box">
                      <div id="google_translate_element"></div>
                    </div>
                    <p className="translate-panel-note" style={{ fontSize: '0.75rem', marginTop: 8 }}>
                      If the language selector does not appear, refresh the page and check whether browser extensions are blocking translate.google.com.
                    </p>
                  </>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic', margin: '8px 0 0' }}>
                  Translation uses Google Translate. Some ministry or Bible terms may need human review.
                </p>
              </div>
            </div>
            <div className="install-banner-actions">
              <button className="btn btn-primary" onClick={() => setShowAccessibilityModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showInstallBanner && (
        <div className="install-banner-overlay">
          <div className="install-banner">
            <div className="install-banner-content">
              <h3>Install Tailender Tracks</h3>
              <p>Add to your home screen for offline field recording and faster access.</p>
            </div>
            <div className="install-banner-actions">
              <button className="btn btn--secondary" onClick={() => setShowInstallBanner(false)}>Later</button>
              <button className="btn btn-primary" style={{ margin: 0, width: 'auto' }} onClick={handleInstallClick}>Install Now</button>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">

      {/* TAILENDER Toshi FAB - bottom left */}
      <button
        className="toshi-fab"
        onClick={() => setShowToshiDialog(true)}
        title="Chat with Tailender Toshi"
      >
        <img src={`${import.meta.env.BASE_URL}icons/Chat with Toshi.png`} alt="Chat with Toshi" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </button>
        <div className={`nav-item ${activeView === 'Home' ? 'active' : ''}`} onClick={() => setActiveView('Home')}>
          <Home size={24} />
          <span>Home</span>
        </div>
        <div className={`nav-item ${activeView === 'Projects' ? 'active' : ''}`} onClick={() => setActiveView('Projects')}>
          <Folder size={24} />
          <span>Projects</span>
        </div>
        <div className={`nav-item ${activeView === 'Training' ? 'active' : ''}`} onClick={() => setActiveView('Training')}>
          <BookOpen size={24} />
          <span>Training</span>
        </div>
        <div className={`nav-item ${activeView === 'Forms' ? 'active' : ''}`} onClick={() => setActiveView('Forms')}>
          <FileText size={24} />
          <span>Forms</span>
        </div>
        <div className={`nav-item ${activeView === 'Settings' ? 'active' : ''}`} onClick={() => setActiveView('Settings')}>
          <Settings size={24} />
          <span>Settings</span>
        </div>
      </nav>

      {/* MODALS */}
      {showToshiDialog && (
        <Modal title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="dymo-label-stack" style={{ gap: 2 }}>
              <span className="dymo-label" style={{ fontSize: '0.7rem', padding: '2px 8px', letterSpacing: '0.2em' }}>TAILENDER</span>
              <span className="dymo-label dymo-label--red" style={{ fontSize: '0.7rem', padding: '2px 8px', letterSpacing: '0.2em' }}>TOSHI</span>
            </div>
            <select
              value={ToshiFilter}
              onChange={e => setToshiFilter(e.target.value)}
              style={{ padding: '2px 8px', borderRadius: 4, width: 'auto', fontSize: '0.75rem', marginRight: 24, fontWeight: 'normal', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              {getTailenderToshiCategories().map((f: string) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        } onClose={() => setShowToshiDialog(false)}>
          <div style={{ height: 420, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              flex: 1, backgroundColor: 'var(--bg-color)', borderRadius: 8, padding: 12, marginBottom: 12,
              border: '1px solid var(--border-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              {ToshiMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  display: 'flex', flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%'
                }}>
                  <div style={{
                    backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--surface-color)',
                    color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                    padding: '8px 12px', borderRadius: 12, fontSize: '0.88rem', lineHeight: 1.5,
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    marginBottom: 4, whiteSpace: 'pre-wrap'
                  }}>
                    {ToshiEasyEnglish[i] && msg.easyEnglish ? msg.easyEnglish : msg.text}
                  </div>
                  {/* Easy English toggle */}
                  {msg.sender === 'Toshi' && msg.easyEnglish && msg.easyEnglish !== msg.text && (
                    <button
                      onClick={() => setToshiEasyEnglish(prev => ({ ...prev, [i]: !prev[i] }))}
                      style={{
                        background: 'none', border: '1px solid var(--border-color)', borderRadius: 8,
                        padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer',
                        color: 'var(--text-secondary)', marginBottom: 4, alignSelf: 'flex-start'
                      }}
                    >
                      {ToshiEasyEnglish[i] ? '📖 Full answer' : '🟢 Easy English'}
                    </button>
                  )}
                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      {msg.actions.map((action: string, j: number) => (
                        <button 
                          key={j} 
                          className="btn" 
                          onClick={() => handleToshiAction(action)}
                          style={{ padding: '4px 8px', fontSize: '0.72rem', width: 'auto', marginBottom: 0, fontWeight: 'normal' }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Related question chips */}
                  {msg.related && msg.related.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                      {msg.related.map((rel: any, j: number) => (
                        <span key={j} onClick={() => handleSendToshiMessage(rel.label)} style={{
                          backgroundColor: 'rgba(122,10,10,0.08)', color: 'var(--accent-color)',
                          padding: '3px 8px', borderRadius: 12, fontSize: '0.72rem', cursor: 'pointer',
                          display: 'inline-block', border: '1px solid rgba(122,10,10,0.2)'
                        }}>
                          {rel.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Suggested Questions for current stage */}
            {ToshiMessages.length < 3 && (
              <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: 4 }}>Try asking:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {getSuggestedToshiQuestions(ToshiFilter).slice(0, 3).map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSendToshiMessage(q)}
                      style={{ 
                        background: 'rgba(128,128,128,0.1)', border: '1px solid var(--border-color)', 
                        borderRadius: 16, padding: '4px 10px', fontSize: '0.72rem', color: 'var(--text-primary)',
                        cursor: 'pointer', whiteSpace: 'nowrap'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="input-group" style={{ marginBottom: 0, display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ask Toshi a question..."
                style={{ margin: 0 }}
                value={ToshiInput}
                onChange={e => setToshiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendToshiMessage()}
              />
              <button className="btn btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => handleSendToshiMessage()}>Send</button>
            </div>
          </div>
        </Modal>
      )}

      {showSignIn && (
        <Modal title="Sign In" onClose={() => setShowSignIn(false)}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="input-group">
              <label>Email / Username</label>
              <input type="text" placeholder="Enter email..." />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Enter password..." />
            </div>
            <button className="btn btn-primary" onClick={() => setShowSignIn(false)}>Sign In</button>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 16, cursor: 'pointer' }}>Create an account</p>
          </div>
        </Modal>
      )}
      </div>
    </>
  );
}
