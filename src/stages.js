// Static metadata for the five learning stages, shared across the sidebar,
// the home grid and the topic view. `key` matches the keys inside `topic.stages`.
export const STAGES = [
  { key: 'diagnosis', num: 1, label: 'Diagnosis', sub: 'Where you start and where you are going' },
  { key: 'map', num: 2, label: 'Territory Map', sub: 'The territory of the skill' },
  { key: 'plan', num: 3, label: 'Attack Plan', sub: 'How you will attack it' },
  { key: 'cycles', num: 4, label: 'Execution Cycle', sub: 'Acquire · Practice · Break · Reflect' },
  { key: 'consolidation', num: 5, label: 'Consolidation', sub: 'Lock in what you learned' },
]

// The cycles stage has no `completed` flag: it counts as started/done once at
// least one cycle has been recorded. Every other stage uses its own flag.
export const isStageCompleted = (topic, key) =>
  key === 'cycles' ? topic.stages.cycles.length > 0 : topic.stages[key].completed

export const countCompleted = (topic) =>
  STAGES.filter((stage) => isStageCompleted(topic, stage.key)).length
