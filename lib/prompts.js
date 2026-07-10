// Server-side prompt and JSON-schema builders for the AI generation endpoint.
// Kept free of browser/React imports so the Vercel function can bundle it.

const SYSTEM = `You are an expert learning coach helping a user work through a structured 5-stage framework for acquiring a practical skill.
You produce concise, concrete, actionable drafts that the user will review and edit — never final answers imposed on them.
Write in the language of the user. Be specific to the user's subject and their diagnosis; avoid generic filler.
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

// The Attack Plan mixes plain-text fields with a structured list of resource
// cards, so it needs its own schema rather than the all-strings fieldsSchema.
const planSchema = () => ({
  type: 'object',
  properties: {
    outputProject: { type: 'string' },
    milestones: { type: 'string' },
    resources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['title', 'note'],
        additionalProperties: false,
      },
    },
    firstAction: { type: 'string' },
    obstacles: { type: 'string' },
  },
  required: ['outputProject', 'milestones', 'resources', 'firstAction', 'obstacles'],
  additionalProperties: false,
})

const resourceSchema = () => ({
  type: 'object',
  properties: {
    summary: { type: 'string' },
    digDeeper: { type: 'string' },
  },
  required: ['summary', 'digDeeper'],
  additionalProperties: false,
})

// Returns { mode, system, prompt, schema } for a stage, or null for unknown stages.
// `extra` carries stage-specific payloads (e.g. the chosen resource for a
// per-card summary).
export const buildRequest = (stage, topic, extra = {}) => {
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

Draft the Attack Plan: a concrete output project that would prove mastery, intermediate milestones toward it, a first action they can take in the next 48 hours, and the predictable obstacles each paired with a response.

For "resources", pick AT MOST 5 focused sources (more than that is a sign of avoiding the work). Return them as a list of objects, each with a "title" (the source plus its author or origin, e.g. "Total TypeScript — Matt Pocock") and a "note": a one-line reason it earns a place and what to use it for. Return JSON matching the schema.`,
        schema: planSchema(),
      }

    case 'resource': {
      const resource = extra.resource || {}
      return {
        // The API wraps any non-coaching result as { fields: ... }; the client
        // reads data.fields for the summary, so keep this in the same shape.
        mode: 'fields',
        system: SYSTEM,
        prompt: `The user is learning: ${subject}.

Diagnosis:
${diagnosisContext(topic)}

Territory map:
${mapContext(topic)}

They have picked this resource as part of their attack plan:
Title: ${resource.title || '(untitled)'}
Why it's on the list: ${resource.note || '(no note)'}

Write a focused summary of the specific ideas, techniques or sections from THIS resource that matter most for the user's goal — concrete enough that they can start applying the core content without opening the source first. Be specific to ${subject} and their goal, and organize it as a few short points rather than an essay. Then write a short "digDeeper" pointer: what to actually go read or work through in the source itself if they want the full depth. Return JSON: { "summary": "...", "digDeeper": "..." }.`,
        schema: resourceSchema(),
      }
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
