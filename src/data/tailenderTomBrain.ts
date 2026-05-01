// Tailender Tom Brain v2 - Offline helper for Tailender Tracks
import brain from './tailender_tom_brain_v2.json';

export const TAILENDER_TOM_BRAIN = brain;

function normalize(text: any): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreText(queryWords: string[], item: any, stage: string): number {
  const fields = [
    item.question,
    item.answer,
    item.easyEnglish,
    item.stage,
    item.category,
    item.intent,
    item.title,
    item.goal,
    item.trigger,
    item.term,
    item.meaning,
    ...(item.tags || [])
  ];
  const haystack = normalize(fields.filter(Boolean).join(' '));
  let score = 0;
  for (const word of queryWords) {
    if (haystack.includes(word)) score += 2;
    if (normalize(item.question || '').includes(word)) score += 5;
    if (normalize(item.title || '').includes(word)) score += 4;
    if ((item.tags || []).map(normalize).includes(word)) score += 5;
  }
  if (stage && normalize(item.stage) === normalize(stage)) score += 8;
  return score;
}

export function searchTailenderTom(query: string, options: any = {}) {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(' ').filter(Boolean);
  const allItems = [
    ...brain.items,
    ...brain.trainingCards,
    ...brain.troubleshootingFlows,
    ...brain.glossary
  ];

  return allItems
    .map(item => ({ ...item, score: scoreText(words, item, options.stage || '') }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 8);
}

export function askTailenderTom(query: string, options: any = {}) {
  const results = searchTailenderTom(query, options);
  if (!results.length) {
    return {
      found: false,
      answer: "I do not have that answer saved offline yet. Mark this question for a trainer or reviewer, and add the answer to Tailender Tom later.",
      easyEnglish: "I do not know yet. Save this question and ask a trainer.",
      suggestions: ["Ask a trainer", "Add this as a new Q&A", "Check the project notes"]
    };
  }

  const best = results[0] as any;
  let answer = best.answer || best.meaning || best.goal || best.trigger || "I found a related training item.";
  if (best.type === 'training_card') {
    answer = `${best.goal}\n\nSteps:\n${best.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
  }
  if (best.type === 'troubleshooting_flow') {
    answer = `${best.trigger}\n\nTry this:\n${best.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
  }

  return {
    found: true,
    id: best.id,
    type: best.type,
    stage: best.stage,
    question: best.question || best.title || best.term,
    answer,
    easyEnglish: best.easyEnglish || answer,
    actions: best.actions || [],
    related: results.slice(1, 5).map((r: any) => ({
      id: r.id,
      type: r.type,
      stage: r.stage,
      label: r.question || r.title || r.term
    }))
  };
}

export function getTailenderTomCategories() {
  return ["All", ...new Set([
    ...brain.workflow,
    "Forms",
    "Teamwork",
    "Training",
    "Troubleshooting",
    "Audio Quality",
    "Offline",
    "Glossary"
  ])];
}
