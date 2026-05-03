import { useState, useEffect } from 'react';
import { 
  Home, Folder, Settings, BookOpen, ChevronLeft, ChevronDown, Plus, Save, Play,
  Download, CheckCircle, Search, Edit3, Mic, CheckSquare, FileText,
  Share2, Sun, Moon, User, Type
} from 'lucide-react';
import { 
  askTailenderToshi, 
  getTailenderToshiCategories, 
  getSuggestedToshiQuestions,
  getToshiBrainStats 
} from './data/tailenderToshiBrain';

import type { Project } from './types';
import { uiText } from './data/uiText';
import { createNewProject } from './data/projectDefaults';
import { FORM_GUIDES, getFormGuide } from './data/formGuides';
import { FieldInput, FieldTextarea, FieldCheckbox, FieldSelect } from './components/Fields';
import { Modal } from './components/Modal';

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

function HomeView({ projects, onOpenProject, onCreateProject, goView, t }: any) {
  const recentProject = projects.length > 0 ? [...projects].sort((a,b) => b.updatedAt - a.updatedAt)[0] : null;

  return (
    <div>
      <div className="view-header">
        <h1>{t.welcome}</h1>
        <p>{t.offlineWorkflow}</p>
      </div>

      <button className="btn btn-primary" onClick={onCreateProject} style={{ marginBottom: 24, padding: 16 }}>
        <Plus size={20} /> {t.createNewProject}
      </button>

      {recentProject && (
        <div className="card" onClick={() => onOpenProject(recentProject.id)} style={{ cursor: 'pointer' }}>
          <h3 className="card-title"><Play size={18} /> {t.continueLastProject}</h3>
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

function ProjectsView({ projects, onOpenProject, onCreateProject, t }: any) {
  const [search, setSearch] = useState('');
  
  const filtered = projects.filter((p: Project) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.languageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="view-header">
        <h1>{t.projects}</h1>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              style={{ paddingLeft: 40 }} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>No projects found.</p>
        ) : (
          filtered.sort((a: any, b: any) => b.updatedAt - a.updatedAt).map((p: any) => (
            <div key={p.id} className="list-item" onClick={() => onOpenProject(p.id)}>
              <div className="list-item-content">
                <h4>{p.title}</h4>
                <p>{p.languageName || 'No language'} • {p.currentStage} • {new Date(p.updatedAt).toLocaleDateString()}</p>
              </div>
              <ChevronLeft size={20} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
            </div>
          ))
        )}
      </div>

      <button className="btn btn-primary" onClick={onCreateProject} style={{ marginTop: 8 }}>
        <Plus size={18} /> {t.createNewProject}
      </button>
    </div>
  );
}

function ProjectDetailView({ project, updateProject, goStage, onSave, t }: any) {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleManualSave = () => {
    onSave();
    setSaveStatus(t.saved);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div>
      <div className="view-header">
        <h1>{t.projectDetails}</h1>
        <p>{t.projectSummary}</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button 
          className="btn btn-primary" 
          onClick={handleManualSave}
          disabled={!!saveStatus}
          style={{ margin: 0, flex: 1 }}
        >
          <Save size={18} /> {saveStatus || t.saveProject}
        </button>
      </div>

      <div className="card">
        <h3 className="card-title"><Edit3 size={18} /> Project Basics</h3>
        <FieldInput label={t.projectTitle} value={project.title} onChange={(v:any) => updateProject({title: v})} />
        <FieldInput label={t.languageName} value={project.languageName} onChange={(v:any) => updateProject({languageName: v})} />
        <FieldInput label={t.dialect} value={project.dialect} onChange={(v:any) => updateProject({dialect: v})} />
        <FieldInput label={t.countryRegion} value={project.countryRegion} onChange={(v:any) => updateProject({countryRegion: v})} />
        <FieldTextarea label={t.targetListeners} value={project.targetListeners} onChange={(v:any) => updateProject({targetListeners: v})} />
      </div>

      <div className="card">
        <h3 className="card-title"><BookOpen size={18} /> Bible & Ministry</h3>
        <FieldTextarea label={t.ministryPurpose} value={project.ministryPurpose} onChange={(v:any) => updateProject({ministryPurpose: v})} />
        <FieldInput label={t.biblicalTheme} value={project.biblicalTheme} onChange={(v:any) => updateProject({biblicalTheme: v})} />
        <FieldInput label={t.scriptureReferences} value={project.scriptureReferences} onChange={(v:any) => updateProject({scriptureReferences: v})} />
        <FieldInput label={t.localChurchPartner} value={project.localChurchPartner} onChange={(v:any) => updateProject({localChurchPartner: v})} />
      </div>

      <div className="card">
        <h3 className="card-title"><FileText size={18} /> {t.projectNotes}</h3>
        <FieldTextarea label={t.projectNotes} value={project.projectNotes} onChange={(v:any) => updateProject({projectNotes: v})} />
      </div>

      <div className="card">
        <h3 className="card-title"><ChevronDown size={18} /> {t.workflowStages}</h3>
        <div className="stage-grid">
          <div className="stage-card" onClick={() => { updateProject({ currentStage: 'Research' }); goStage('Research'); }}>
            <Search size={24} />
            <span>{t.research}</span>
          </div>
          <div className="stage-card" onClick={() => { updateProject({ currentStage: 'Plan' }); goStage('Plan'); }}>
            <Plus size={24} />
            <span>{t.plan}</span>
          </div>
          <div className="stage-card" onClick={() => { updateProject({ currentStage: 'Record' }); goStage('Record'); }}>
            <Mic size={24} />
            <span>{t.record}</span>
          </div>
          <div className="stage-card" onClick={() => { updateProject({ currentStage: 'Program' }); goStage('Program'); }}>
            <Play size={24} />
            <span>{t.program}</span>
          </div>
          <div className="stage-card" onClick={() => { updateProject({ currentStage: 'Submit' }); goStage('Submit'); }}>
            <CheckCircle size={24} />
            <span>{t.submit}</span>
          </div>
          <div className="stage-card" onClick={() => { updateProject({ currentStage: 'Share' }); goStage('Share'); }}>
            <Share2 size={24} />
            <span>{t.share}</span>
          </div>
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
function FormsView({ formsManifest, t }: any) {
  const stageOrder = ['Research', 'Plan', 'Record', 'Program', 'Submit', 'Share'];
  return (
    <div>
      <div className="view-header">
        <h1>{t.forms}</h1>
        <p>Project documentation and check-sheets</p>
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
function TrainingView({ t }: any) {
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
        <h1>{t.training}</h1>
        <p>Field skills and recording guides</p>
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
function SettingsView({ deferredPrompt, onInstallClick, settings, updateSetting, dataHandlers, t }: any) {
  return (
    <div>
      <div className="view-header">
        <h1>{t.settings}</h1>
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
            label={t.interfaceLanguage} 
            value={settings.interfaceLanguage} 
            onChange={(v:string) => updateSetting('interfaceLanguage', v)} 
            options={['English', 'ไทย']} 
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: -8 }}>
            More interface translation is coming later.
          </p>
        </div>
        <FieldSelect 
          label={t.fontNoto} 
          value={settings.fontStyle} 
          onChange={(v:string) => updateSetting('fontStyle', v)} 
          options={['default', 'dyslexia', 'thaiEnglish']} 
        />
      </div>

      <div className="card">
        <h3 className="card-title">Data &amp; Storage</h3>
        <button className="btn" onClick={dataHandlers.onStorage}><BookOpen size={18} /> Storage Manager</button>
        <button className="btn" onClick={dataHandlers.onExport}><Download size={18} /> Backup / Export Projects</button>
        <button className="btn" onClick={dataHandlers.onImport}><CheckSquare size={18} /> Import Project Backup</button>
      </div>

      <div className="card">
        <h3 className="card-title">{t.installApp}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          Install Tailender Tracks so it can open like an app on this device for offline field recording access.
        </p>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={onInstallClick}>
          {t.installTailenderTracks}
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
  const [textScale, setTextScale] = useState(() => parseInt(localStorage.getItem('tailender_text_scale') || '100'));

  const handleReadPage = () => {
    const mainContent = document.querySelector('.main-content');
    const text = mainContent ? (mainContent as HTMLElement).innerText : '';
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = interfaceLanguage === 'ไทย' || interfaceLanguage === 'Thai' ? 'th-TH' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleStopReading = () => {
    window.speechSynthesis.cancel();
  };

  const [orgName, setOrgName] = useState(() => localStorage.getItem('tailender_org_name') || '');
  const [defaultRegion, setDefaultRegion] = useState(() => localStorage.getItem('tailender_default_region') || 'Global');
  const [interfaceLanguage, setInterfaceLanguage] = useState(() => localStorage.getItem('tailender_interface_language') || 'English');

  const t = uiText[interfaceLanguage === 'ไทย' || interfaceLanguage === 'th' ? 'th' : 'en'];

  const [splashState, setSplashState] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    // Apply accessibility classes to body
    const body = document.body;
    body.classList.remove('app-font-default', 'app-font-dyslexia', 'app-font-thai-english');
    
    if (fontStyle === 'dyslexia') body.classList.add('app-font-dyslexia');
    else if (fontStyle === 'thaiEnglish') body.classList.add('app-font-thai-english');
    else body.classList.add('app-font-default');

    body.style.setProperty("--app-text-scale", `${textScale}%`);

    localStorage.setItem('tailender_font_style', fontStyle);
    localStorage.setItem('tailender_text_scale', String(textScale));
    localStorage.setItem('tailender_org_name', orgName);
    localStorage.setItem('tailender_default_region', defaultRegion);
    localStorage.setItem('tailender_interface_language', interfaceLanguage);
  }, [fontStyle, textScale, orgName, defaultRegion, interfaceLanguage]);

  const [translateError, setTranslateError] = useState(false);

  useEffect(() => {
    if (!showAccessibilityModal) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById("google_translate_element");
      if (!el) return;

      if (el.childElementCount === 0 && window.googleTranslateElementInit) {
        window.googleTranslateElementInit();
        
        // Check if it actually loaded after a bit
        setTimeout(() => {
          if (el.childElementCount === 0) setTranslateError(true);
          else setTranslateError(false);
        }, 3000);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [showAccessibilityModal]);

  // Toshi Chat State
  const [ToshiFilter, setToshiFilter] = useState('All');
  const [ToshiEasyEnglish, setToshiEasyEnglish] = useState<Record<number, boolean>>({});
  const stats = getToshiBrainStats();
  const [ToshiMessages, setToshiMessages] = useState<any[]>([
    { sender: 'Toshi', text: `Hello Friend! I am Tailender Toshi — your offline field recording guide. I have ${stats.total} items ready. Ask me anything about Research, Recording, Troubleshooting, Glossary terms, and more!` }
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
    if (activeView === 'Home') return <HomeView projects={projects} onOpenProject={handleOpenProject} onCreateProject={handleCreateProject} goView={setActiveView} t={t} />;
    if (activeView === 'Projects') return <ProjectsView projects={projects} onOpenProject={handleOpenProject} onCreateProject={handleCreateProject} t={t} />;
    if (activeView === 'Training') return <TrainingView t={t} />;
    if (activeView === 'Forms') return <FormsView formsManifest={formsManifest} t={t} />;
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
        t={t}
      />
    );
    
    // Project specific views
    if (!currentProject) return <div style={{padding: 24}}>Project not found.</div>;
    
    if (activeView === 'ProjectDetail') return <ProjectDetailView project={currentProject} updateProject={updateProjectLevel} goStage={setActiveView} onSave={saveProjectNow} t={t} />;
    if (activeView === 'Research') return <StageResearch project={currentProject} update={updateProjectSection} formsManifest={formsManifest} t={t} />;
    if (activeView === 'Plan') return <StagePlan project={currentProject} update={updateProjectSection} formsManifest={formsManifest} t={t} />;
    if (activeView === 'Record') return <StageRecord project={currentProject} update={updateProjectSection} formsManifest={formsManifest} t={t} />;
    if (activeView === 'Program') return <StageProgram project={currentProject} update={updateProjectSection} formsManifest={formsManifest} t={t} />;
    if (activeView === 'Submit') return <StageSubmit project={currentProject} update={updateProjectSection} formsManifest={formsManifest} t={t} />;
    if (activeView === 'Share') return <StageShare project={currentProject} update={updateProjectSection} formsManifest={formsManifest} t={t} />;
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
            <button
              className="icon-btn"
              onClick={() => setShowAccessibilityModal(true)}
              title="Accessibility, language, and reader tools"
              aria-label="Accessibility, language, and reader tools"
            >
              <Type size={22} />
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
        <Modal title="Accessibility & Language" onClose={() => setShowAccessibilityModal(false)}>
          <div className="accessibility-panel">
            
            <div className="accessibility-section">
              <h4 className="accessibility-section-title">Font</h4>
              <div className="accessibility-button-group">
                <button 
                  className={`btn ${fontStyle === 'default' ? 'btn-primary' : ''}`} 
                  onClick={() => setFontStyle('default')}
                >
                  Default Noto
                </button>
                <button 
                  className={`btn ${fontStyle === 'dyslexia' ? 'btn-primary' : ''}`} 
                  onClick={() => setFontStyle('dyslexia')}
                >
                  OpenDyslexic
                </button>
                <button 
                  className={`btn ${fontStyle === 'thaiEnglish' ? 'btn-primary' : ''}`} 
                  onClick={() => setFontStyle('thaiEnglish')}
                >
                  Thai / English
                </button>
              </div>
            </div>

            <div className="accessibility-section">
              <h4 className="accessibility-section-title">Text Size</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="90"
                  max="130"
                  step="5"
                  value={textScale}
                  onChange={(e) => setTextScale(Number(e.target.value))}
                  className="text-size-slider"
                />
                <span style={{ minWidth: '45px', fontWeight: 'bold' }}>{textScale}%</span>
              </div>
            </div>

            <div className="accessibility-section">
              <h4 className="accessibility-section-title">Interface Language</h4>
              <div className="accessibility-button-group">
                <button 
                  className={`btn ${interfaceLanguage === 'English' ? 'btn-primary' : ''}`} 
                  onClick={() => setInterfaceLanguage('English')}
                >
                  English
                </button>
                <button 
                  className={`btn ${interfaceLanguage === 'ไทย' ? 'btn-primary' : ''}`} 
                  onClick={() => setInterfaceLanguage('ไทย')}
                >
                  ไทย
                </button>
              </div>
            </div>

            <div className="accessibility-section">
              <h4 className="accessibility-section-title">Reader</h4>
              <div className="accessibility-button-group">
                <button className="btn" onClick={() => {
                  if (window.speechSynthesis) {
                    handleReadPage();
                  } else {
                    alert("Reader is not available in this browser.");
                  }
                }}>
                  Read Page
                </button>
                <button className="btn" onClick={handleStopReading}>
                  Stop
                </button>
              </div>
            </div>

            <div className="accessibility-section">
              <h4 className="accessibility-section-title">Google Translate</h4>
              <button 
                className="btn btn--secondary" 
                style={{ width: 'auto', marginBottom: '12px' }} 
                onClick={() => {
                  if (window.googleTranslateElementInit) window.googleTranslateElementInit();
                }}
              >
                Open Google Translate
              </button>
              
              <div className="translate-widget-box">
                <div id="google_translate_element"></div>
              </div>

              {translateError && (
                <p style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Google Translate did not load. It may be blocked, offline, or unavailable for this site.
                </p>
              )}
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                “Google Translate requires internet access. Bible and ministry terms should be checked by a human.”
              </p>
            </div>

            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowAccessibilityModal(false)}>
              Close
            </button>
          </div>
        </Modal>
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

      <button
        className="toshi-fab"
        onClick={() => setShowToshiDialog(true)}
        title="Chat with Tailender Toshi"
      >
        <img src={`${import.meta.env.BASE_URL}icons/Chat with Toshi.png`} alt="Chat with Toshi" />
      </button>

      <nav className="bottom-nav">
        <div className={`nav-item ${activeView === 'Home' ? 'active' : ''}`} onClick={() => setActiveView('Home')}>
          <Home size={24} />
          <span>{t.home}</span>
        </div>
        <div className={`nav-item ${activeView === 'Projects' ? 'active' : ''}`} onClick={() => setActiveView('Projects')}>
          <Folder size={24} />
          <span>{t.projects}</span>
        </div>
        <div className={`nav-item ${activeView === 'Forms' ? 'active' : ''}`} onClick={() => setActiveView('Forms')}>
          <FileText size={24} />
          <span>{t.forms}</span>
        </div>
        <div className={`nav-item ${activeView === 'Training' ? 'active' : ''}`} onClick={() => setActiveView('Training')}>
          <BookOpen size={24} />
          <span>{t.training}</span>
        </div>
        <div className={`nav-item ${activeView === 'Settings' ? 'active' : ''}`} onClick={() => setActiveView('Settings')}>
          <Settings size={24} />
          <span>{t.settings}</span>
        </div>
      </nav>

      {/* MODALS */}
      {showToshiDialog && (
        <Modal title={
          <div className="toshi-chat-header">
            <div className="toshi-chat-brand">
              <img
                src={`${import.meta.env.BASE_URL}icons/DYMO-Black-TAILENDER.png`}
                alt="TAILENDER"
                className="toshi-chat-dymo-label"
              />
              <img
                src={`${import.meta.env.BASE_URL}icons/DYMO-Red-TOSHI.png`}
                alt="TOSHI"
                className="toshi-chat-dymo-label toshi-chat-dymo-label--toshi"
              />
            </div>
            <div className="toshi-chat-filter-wrap">
              <select
                value={ToshiFilter}
                onChange={e => setToshiFilter(e.target.value)}
              >
                {getTailenderToshiCategories().map((f: string) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            {/* Close button is handled by Modal component, but we ensure layout space */}
            <div style={{ width: 24 }}></div>
          </div>
        } onClose={() => setShowToshiDialog(false)}>
          <div className="toshi-chat-modal" style={{ height: 420, display: 'flex', flexDirection: 'column' }}>
            <div className="toshi-chat-messages" style={{
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
                    padding: '8px 12px', borderRadius: 12, lineHeight: 1.45,
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    marginBottom: 4, whiteSpace: 'pre-wrap'
                  }}
                  className="toshi-message"
                  >
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
                    <div className="toshi-suggestions" style={{ marginTop: 2 }}>
                      {msg.related.map((rel: any, j: number) => (
                        <span key={j} onClick={() => handleSendToshiMessage(rel.label)} className="toshi-suggestion-chip" style={{
                          backgroundColor: 'rgba(122,10,10,0.08)', color: 'var(--accent-color)',
                          padding: '3px 8px', borderRadius: 12, cursor: 'pointer',
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 4 }}>Try asking:</span>
                <div className="toshi-suggestions">
                  {getSuggestedToshiQuestions(ToshiFilter).slice(0, 3).map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSendToshiMessage(q)}
                      className="toshi-suggestion-chip"
                      style={{ 
                        background: 'rgba(128,128,128,0.1)', border: '1px solid var(--border-color)', 
                        borderRadius: 16, padding: '4px 10px', color: 'var(--text-primary)',
                        cursor: 'pointer'
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
        <Modal title="Sign In / Security" onClose={() => setShowSignIn(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ lineHeight: 1.5, color: 'var(--text-primary)' }}>
              “Sign-in is planned because some field recording projects may contain sensitive people, place, language, or ministry information.”
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Security features are coming in a future update to help protect project data.
            </p>
            <button className="btn btn-primary" onClick={() => setShowSignIn(false)}>Close</button>
          </div>
        </Modal>
      )}
      </div>
    </>
  );
}
