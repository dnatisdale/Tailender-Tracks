import { useState, useEffect } from 'react';
import { 
  Home, Folder, Settings, BookOpen, ChevronLeft, Plus, Save, Play,
  Download, CheckCircle, Search, Edit3, Mic, CheckSquare, FileText,
  Share2, MessageCircle, Sun, Moon, User, X
} from 'lucide-react';
import { askTailenderTom, getTailenderTomCategories } from './data/tailenderTomBrain';
import './index.css';

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
    <div className="card">
      <h3 className="card-title">Required Forms</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {stageForms.map((f: any, i: number) => (
          <a key={i} href={f.file} target="_blank" rel="noopener noreferrer" className="btn" style={{ justifyContent: 'flex-start', margin: 0 }}>
            <FileText size={18} /> {f.title}
          </a>
        ))}
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

function ProjectDetailView({ project, updateProject, goStage }: any) {
  if(!project) return null;
  const stages: Stage[] = ['Research', 'Plan', 'Record', 'Program', 'Submit', 'Share'];

  return (
    <div>
      <div className="card">
        <h3 className="card-title"><Edit3 size={18} /> Project Summary</h3>
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

// TRAINING VIEW
function TrainingView() {
  return (
    <div>
      <div className="view-header">
        <h1>Training</h1>
        <p>Learn the 6-Stage Christian Workflow</p>
      </div>

      <div className="card">
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

      {[
        { t: '1. Research', d: 'How to confirm the heart language.' },
        { t: '2. Plan', d: 'How to prepare a script and care for speakers.' },
        { t: '3. Record', d: 'How to record clean audio.' },
        { t: '4. Program', d: 'How to organize a program.' },
        { t: '5. Submit', d: 'How to submit a complete package.' },
        { t: '6. Share', d: 'How to share recordings wisely.' }
      ].map((card, i) => (
        <div key={i} className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 4 }}>{card.t}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{card.d}</div>
        </div>
      ))}
    </div>
  );
}

// SETTINGS VIEW
function SettingsView() {
  return (
    <div>
      <div className="view-header">
        <h1>Settings</h1>
        <p>App preferences and data management</p>
      </div>

      <div className="card">
        <h3 className="card-title">App Configuration</h3>
        <FieldInput label="App Name" value="Tailender Tracks" onChange={()=>{}} />
        <FieldInput label="Ministry / Organization Name" value="" onChange={()=>{}} placeholder="Your Organization..." />
        <FieldSelect label="Default Country / Region" value="" onChange={()=>{}} options={['Global', 'Africa', 'Asia', 'Americas']} />
        <FieldSelect label="Interface Language (Placeholder)" value="English" onChange={()=>{}} options={['English']} />
        <FieldCheckbox label="Easy English Mode (Placeholder)" checked={false} onChange={()=>{}} />
      </div>

      <div className="card">
        <h3 className="card-title">Data & Storage</h3>
        <button className="btn"><Save size={18} /> Storage Manager (Placeholder)</button>
        <button className="btn"><Download size={18} /> Backup / Export Projects (Placeholder)</button>
        <button className="btn"><CheckSquare size={18} /> Import Project (Placeholder)</button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 32, opacity: 0.5 }}>
        <img src={`${import.meta.env.BASE_URL}icons/tailender-buckle.png`} alt="Logo" style={{ height: 40 }} />
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
  const [showTomDialog, setShowTomDialog] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [splashState, setSplashState] = useState<'visible' | 'fading' | 'hidden'>('visible');

  // Tom Chat State
  const [tomFilter, setTomFilter] = useState('All');
  const [tomEasyEnglish, setTomEasyEnglish] = useState<Record<number, boolean>>({});
  const [tomMessages, setTomMessages] = useState<any[]>([
    { sender: 'tom', text: 'Howdy! I am Tailender Tom — your offline field recording guide. I have 163 items ready. Ask me anything about Research, Recording, Troubleshooting, Glossary terms, and more!' }
  ]);
  const [tomInput, setTomInput] = useState('');

  const handleSendTomMessage = (textToSubmit?: string) => {
    const text = typeof textToSubmit === 'string' ? textToSubmit : tomInput;
    if (!text.trim()) return;
    const newMsgs = [...tomMessages, { sender: 'user', text }];
    setTomMessages(newMsgs);
    setTomInput('');
    setTimeout(() => {
      const response = askTailenderTom(text, { stage: tomFilter === 'All' ? '' : tomFilter, limit: 8 });
      setTomMessages(prev => [...prev, {
        sender: 'tom',
        text: response.answer,
        easyEnglish: response.easyEnglish,
        actions: response.actions || response.suggestions,
        related: response.related
      }]);
    }, 600);
  };

  useEffect(() => {
    const timer1 = setTimeout(() => setSplashState('fading'), 1500);
    const timer2 = setTimeout(() => setSplashState('hidden'), 2000);
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
    if (activeView === 'Settings') return <SettingsView />;
    
    // Project specific views
    if (!currentProject) return <div style={{padding: 24}}>Project not found.</div>;
    
    if (activeView === 'ProjectDetail') return <ProjectDetailView project={currentProject} updateProject={updateProjectLevel} goStage={setActiveView} />;
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
          <img src={`${import.meta.env.BASE_URL}icons/tailender-buckle.png`} alt="Logo" className="splash-logo" />
          <div className="splash-title">TAILENDER TRACKS</div>
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
            <img src={`${import.meta.env.BASE_URL}icons/tailender-buckle.png`} alt="Tailender Tracks Logo" />
          )}
          <span className={!isProjectView ? 'dymo-label' : ''}>
            {isProjectView ? (activeView === 'ProjectDetail' ? 'Project Details' : activeView) : 'TAILENDER TRACKS'}
          </span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={toggleDarkMode} title="Toggle Light/Dark">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="icon-btn" onClick={handleShare} title="Share App">
            <Share2 size={20} />
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

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">

      {/* TAILENDER TOM FAB - bottom left */}
      <button
        className="tom-fab"
        onClick={() => setShowTomDialog(true)}
        title="Chat with Tailender Tom"
      >
        <MessageCircle size={24} />
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
        <div className={`nav-item ${activeView === 'Settings' ? 'active' : ''}`} onClick={() => setActiveView('Settings')}>
          <Settings size={24} />
          <span>Settings</span>
        </div>
      </nav>

      {/* MODALS */}
      {showTomDialog && (
        <Modal title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>Tailender Tom</span>
            <select
              value={tomFilter}
              onChange={e => setTomFilter(e.target.value)}
              style={{ padding: '2px 8px', borderRadius: 4, width: 'auto', fontSize: '0.75rem', marginRight: 24, fontWeight: 'normal', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              {getTailenderTomCategories().map((f: string) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        } onClose={() => setShowTomDialog(false)}>
          <div style={{ height: 420, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              flex: 1, backgroundColor: 'var(--bg-color)', borderRadius: 8, padding: 12, marginBottom: 12,
              border: '1px solid var(--border-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              {tomMessages.map((msg, i) => (
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
                    {tomEasyEnglish[i] && msg.easyEnglish ? msg.easyEnglish : msg.text}
                  </div>
                  {/* Easy English toggle */}
                  {msg.sender === 'tom' && msg.easyEnglish && msg.easyEnglish !== msg.text && (
                    <button
                      onClick={() => setTomEasyEnglish(prev => ({ ...prev, [i]: !prev[i] }))}
                      style={{
                        background: 'none', border: '1px solid var(--border-color)', borderRadius: 8,
                        padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer',
                        color: 'var(--text-secondary)', marginBottom: 4, alignSelf: 'flex-start'
                      }}
                    >
                      {tomEasyEnglish[i] ? '📖 Full answer' : '🟢 Easy English'}
                    </button>
                  )}
                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      {msg.actions.map((action: string, j: number) => (
                        <button key={j} className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', width: 'auto', marginBottom: 0, fontWeight: 'normal' }}>
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Related question chips */}
                  {msg.related && msg.related.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                      {msg.related.map((rel: any, j: number) => (
                        <span key={j} onClick={() => handleSendTomMessage(rel.label)} style={{
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
            <div className="input-group" style={{ marginBottom: 0, display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ask Tom a question..."
                style={{ margin: 0 }}
                value={tomInput}
                onChange={e => setTomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendTomMessage()}
              />
              <button className="btn btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => handleSendTomMessage()}>Send</button>
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
