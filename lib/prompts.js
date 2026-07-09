// Server-side prompt and JSON-schema builders for the AI generation endpoint.
// Kept free of browser/React imports so the Vercel function can bundle it.

const SYSTEM = `You are an expert learning coach helping a user work through a structured 5-stage framework for acquiring a practical skill.
You produce concise, concrete, actionable drafts that the user will review and edit — never final answers imposed on them.
Write in English. Be specific to the user's subject and their diagnosis; avoid generic filler.
Each field should be a few sentences or a short list, not an essay.`

const LEVELS = {
  '0': 'Zero contact',
  '1': 'Somewhat superficial',
  '2': 'Clear basics',
  '3': 'Intermediate',
}

const line = (label, value) =>
  `${label}: ${value && String(value).trim() ? String(value).trim() : '(not provided)'}`

const diagnosisContext = (topic) => {
  const d = topic.stages.diagnosis
  return [
    line('Subject', d.topic || topic.name),
    line('Current ability', d.currentAbility),
    line('Self-assessed level', LEVELS[d.level] || '(not provided)'),
    line('Goal', d.goal),
    line('Success criterion', d.successCriterion),
    line('Project hypothesis', d.project),
    line('Motivation', d.motivation),
    line('Learning styles', (d.styles || []).join(', ')),
    line('Weekly time', d.time),
    line('Deadline', d.deadline),
  ].join('\n')
}

const mapContext = (topic) => {
  const m = topic.stages.map
  return [
    line('Key concepts', m.keyConcepts),
    line('Dependencies', m.dependencies),
    line('In / out of scope', m.inScope),
    line('Critical gaps', m.gaps),
    line('Sources', m.sources),
  ].join('\n')
}

const fieldsSchema = (keys) => ({
  type: 'object',
  properties: Object.fromEntries(keys.map((key) => [key, { type: 'string' }])),
  required: keys,
  additionalProperties: false,
})

const coachingSchema = () => ({
  type: 'object',
  properties: { coaching: { type: 'string' } },
  required: ['coaching'],
  additionalProperties: false,
})

// Returns { mode, system, prompt, schema } for a stage, or null for unknown stages.
export const buildRequest = (stage, topic) => {
  const subject = (topic?.stages?.diagnosis?.topic || topic?.name || 'the skill').trim()

  switch (stage) {
    case 'diagnosis':
      return {
        mode: 'fields',
        system: SYSTEM,
        prompt: `The user wants to learn: ${subject}.

What they've told us so far:
${diagnosisContext(topic)}

Draft concise, concrete suggestions for these diagnosis fields, tailored to this subject. Frame the goal as an observable outcome — something they can build, ship or demonstrate — never as "understanding" the topic. Return JSON matching the schema.`,
        schema: fieldsSchema(['currentAbility', 'goal', 'successCriterion', 'project', 'motivation']),
      }

    case 'map':
      return {
        mode: 'fields',
        system: SYSTEM,
        prompt: `The user is learning: ${subject}.

Their diagnosis:
${diagnosisContext(topic)}

Draft the Territory Map. Provide the key concepts, the dependency chain between them (use "A → B → C" style), what is in scope vs deliberately out of scope for this goal, the most critical gaps to close first, and a few high-quality reference sources. Return JSON matching the schema.`,
        schema: fieldsSchema(['keyConcepts', 'dependencies', 'inScope', 'gaps', 'sources']),
      }

    case 'plan':
      return {
        mode: 'fields',
        system: SYSTEM,
        prompt: `The user is learning: ${subject}.

Diagnosis:
${diagnosisContext(topic)}

Territory map:
${mapContext(topic)}

Draft the Attack Plan: a concrete output project that would prove mastery, intermediate milestones toward it, at most 5 focused resources, a first action they can take in the next 48 hours, and the predictable obstacles each paired with a response. Return JSON matching the schema.`,
        schema: fieldsSchema(['outputProject', 'milestones', 'resources', 'firstAction', 'obstacles']),
      }

    case 'cycles':
      return {
        mode: 'coaching',
        system: SYSTEM,
        prompt: `The user is learning: ${subject}.

Diagnosis:
${diagnosisContext(topic)}

Territory map:
${mapContext(topic)}

Coach them on running a strong FIRST execution cycle. Cover: what to acquire first, how to practice it deliberately, one thing worth intentionally breaking to find the edges, and the kind of limitation to watch for. Do NOT write their cycle log for them — give guidance they will act on. Keep it to a few short, concrete points. Return JSON: { "coaching": "..." }.`,
        schema: coachingSchema(),
      }

    case 'consolidation':
      return {
        mode: 'coaching',
        system: SYSTEM,
        prompt: `The user is finishing learning: ${subject}.

Diagnosis:
${diagnosisContext(topic)}

Guide their consolidation with pointed reflective questions — do NOT answer them for the user. Prompt them to judge whether they met their success criterion (with evidence), what they learned about the process, connections to other fields, open questions, and how they would teach the core in 10 minutes. Keep it short and specific to this subject. Return JSON: { "coaching": "..." }.`,
        schema: coachingSchema(),
      }

    default:
      return null
  }
}
