import type { FormGuide } from '../types';

export const FORM_GUIDES: FormGuide[] = [
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

export const getFormGuide = (title: string) => FORM_GUIDES.find(f => f.title === title);
