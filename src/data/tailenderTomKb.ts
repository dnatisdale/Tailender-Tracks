// Tailender Tom Offline Knowledge Base helper
import knowledgeBase from './tailender_tom_qa_seed.json';

export const TAILENDER_TOM_KB = knowledgeBase;

function normalize(text: any) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function searchTailenderTom(query: string, options: any = {}) {
  const q = normalize(query);
  const stage = options.stage ? normalize(options.stage) : '';
  const words = q.split(' ').filter(Boolean);
  if (!q) return [];

  return TAILENDER_TOM_KB.items
    .map(item => {
      const haystack = normalize([
        item.question,
        item.answer,
        item.stage,
        item.intent,
        ...(item.tags || [])
      ].join(' '));

      let score = 0;
      for (const word of words) {
        if (haystack.includes(word)) score += 2;
        if (normalize(item.question).includes(word)) score += 3;
        if ((item.tags || []).map(normalize).includes(word)) score += 4;
      }
      if (stage && normalize(item.stage) === stage) score += 5;
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 5);
}

export function askTailenderTom(query: string, options: any = {}) {
  const results = searchTailenderTom(query, options);
  if (!results.length) {
    return {
      found: false,
      answer: "I do not have that answer saved offline yet. Mark this question for a trainer or reviewer, and add the answer to Tailender Tom later.",
      suggestions: ["Ask a trainer", "Add this as a new Q&A", "Check the project notes"]
    };
  }

  const best = results[0];
  return {
    found: true,
    id: best.id,
    stage: best.stage,
    question: best.question,
    answer: best.answer,
    actions: best.actions || [],
    related: results.slice(1, 4).map(r => ({ id: r.id, question: r.question, stage: r.stage }))
  };
}
