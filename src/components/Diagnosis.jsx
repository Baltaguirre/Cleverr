import {
  StageHeader,
  SectionBlock,
  Field,
  Chips,
  CriterionBox,
  Warning,
  SaveButton,
  SuggestBar,
  SuggestionCard,
} from './ui'
import { useSaveFeedback } from '../hooks/useSaveFeedback'
import { useGeneration } from '../hooks/useGeneration'

const LEVELS = [
  { v: '0', label: 'Zero contact' },
  { v: '1', label: 'Somewhat superficial' },
  { v: '2', label: 'Clear basics' },
  { v: '3', label: 'Intermediate' },
]

const STYLES = [
  { v: 'projects', label: 'Projects' },
  { v: 'structure', label: 'Structure' },
  { v: 'selfTaught', label: 'Self-taught' },
  { v: 'social', label: 'Social' },
]

const TIME = [
  { v: '1-2', label: '1–2 h' },
  { v: '3-5', label: '3–5 h' },
  { v: '6-10', label: '6–10 h' },
  { v: '10+', label: '+10 h' },
]

const DEADLINE = [
  { v: 'yes', label: 'Yes' },
  { v: 'auto', label: 'Self-imposed' },
  { v: 'no', label: 'No' },
]

// Vague verbs that signal a goal phrased as an intention rather than an outcome.
const VAGUE_STARTS = ['understand', 'know about', 'learn about', 'get to know', 'comprehend', 'familiarize']

const Diagnosis = ({ data, update, topic, passphrase }) => {
  const [saved, triggerSave] = useSaveFeedback()
  const gen = useGeneration('diagnosis', () => topic, passphrase)
  const set = (field, value) => update({ [field]: value })

  const goalIsVague = VAGUE_STARTS.some((verb) => data.goal.trim().toLowerCase().startsWith(verb))

  const accept = (field) => {
    set(field, gen.suggestions[field])
    gen.dismiss(field)
  }
  const acceptAll = () => {
    Object.entries(gen.suggestions).forEach(([field, value]) => set(field, value))
    gen.clearSuggestions()
  }
  const suggestionFor = (field) =>
    gen.suggestions?.[field] ? (
      <SuggestionCard text={gen.suggestions[field]} onAccept={() => accept(field)} onDismiss={() => gen.dismiss(field)} />
    ) : null

  const hasSubject = data.topic.trim() !== ''

  const save = () => {
    update({ completed: true })
    triggerSave()
  }

  return (
    <div className="stage">
      <StageHeader number="1" title="Diagnosis" subtitle="Where you start and where you are going" />

      <SuggestBar
        label="✨ Suggest from subject"
        onSuggest={gen.run}
        loading={gen.loading}
        error={gen.error}
        disabled={!passphrase || !hasSubject}
        disabledHint={
          !passphrase
            ? 'Add your access passphrase in AI settings to enable.'
            : 'Enter the topic first to get suggestions.'
        }
      >
        {gen.suggestions && (
          <button type="button" className="btn-mini btn-mini-accent" onClick={acceptAll}>
            Accept all
          </button>
        )}
      </SuggestBar>

      <SectionBlock tag="A" title="Starting point">
        <Field label="Topic">
          <input
            value={data.topic}
            onChange={(e) => set('topic', e.target.value)}
            placeholder="e.g. Figma, React, photography"
          />
        </Field>
        <Field label="Current ability" hint="What can you already do with this skill today?">
          <textarea value={data.currentAbility} onChange={(e) => set('currentAbility', e.target.value)} />
          {suggestionFor('currentAbility')}
        </Field>
        <Field label="Level" hint="How much contact have you had with this skill so far?">
          <Chips options={LEVELS} value={data.level} onChange={(v) => set('level', v)} />
          {data.level === '3' && (
            <Warning>
              Careful with “Intermediate” — it is easy to overestimate your baseline. Make sure you can
              demonstrate it.
            </Warning>
          )}
        </Field>
      </SectionBlock>

      <SectionBlock tag="B" title="Concrete destination">
        <Field label="Goal" hint="Phrase it as an observable outcome, not just “understanding” the topic.">
          <textarea value={data.goal} onChange={(e) => set('goal', e.target.value)} />
          {goalIsVague && (
            <Warning>
              This sounds like a vague intention. Reframe it as something you can build, ship or demonstrate.
            </Warning>
          )}
          {suggestionFor('goal')}
        </Field>
        <Field label="Success criterion" hint="How will you know you got there? What will you be able to do?">
          <textarea value={data.successCriterion} onChange={(e) => set('successCriterion', e.target.value)} />
          {suggestionFor('successCriterion')}
        </Field>
        <Field label="Project hypothesis" hint="What could you build to prove you learned it?">
          <textarea value={data.project} onChange={(e) => set('project', e.target.value)} />
          {suggestionFor('project')}
        </Field>
      </SectionBlock>

      <SectionBlock tag="C" title="Real motivation">
        <Field
          label="Consequence of not learning it"
          hint="What happens if you do not? Why does it matter now?"
        >
          <textarea value={data.motivation} onChange={(e) => set('motivation', e.target.value)} />
          {suggestionFor('motivation')}
        </Field>
      </SectionBlock>

      <SectionBlock tag="D" title="Context">
        <Field label="Learning styles" hint="How do you learn best? Pick all that apply.">
          <Chips options={STYLES} value={data.styles} onChange={(v) => set('styles', v)} multi />
        </Field>
        <Field label="Real weekly time" hint="Be honest about the hours you can actually put in.">
          <Chips options={TIME} value={data.time} onChange={(v) => set('time', v)} />
        </Field>
        <Field label="Deadline">
          <Chips options={DEADLINE} value={data.deadline} onChange={(v) => set('deadline', v)} />
        </Field>
      </SectionBlock>

      <CriterionBox>
        <strong>Completion criterion:</strong> You have a concrete destination — a success criterion you could
        verify, not just “understanding” the topic.
      </CriterionBox>

      <div className="stage-actions">
        <SaveButton label="Save Diagnosis" onSave={save} saved={saved} />
      </div>
    </div>
  )
}

export default Diagnosis
