import { StageHeader, SectionBlock, Field, CriterionBox, SaveButton, SuggestBar, SuggestionCard } from './ui'
import { useSaveFeedback } from '../hooks/useSaveFeedback'
import { useGeneration } from '../hooks/useGeneration'

const Plan = ({ data, update, topic, passphrase }) => {
  const [saved, triggerSave] = useSaveFeedback()
  const gen = useGeneration('plan', () => topic, passphrase)
  const set = (field, value) => update({ [field]: value })

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

  const save = () => {
    update({ completed: true })
    triggerSave()
  }

  return (
    <div className="stage">
      <StageHeader number="3" title="Attack Plan" subtitle="How you will attack it" />

      <SuggestBar
        label="✨ Draft with AI"
        onSuggest={gen.run}
        loading={gen.loading}
        error={gen.error}
        disabled={!passphrase}
        disabledHint="Add your access passphrase in AI settings to enable."
      >
        {gen.suggestions && (
          <button type="button" className="btn-mini btn-mini-accent" onClick={acceptAll}>
            Accept all
          </button>
        )}
      </SuggestBar>

      <SectionBlock title="Planning the attack">
        <Field label="Output project" hint="The concrete thing you will build to prove you learned it.">
          <textarea value={data.outputProject} onChange={(e) => set('outputProject', e.target.value)} />
          {suggestionFor('outputProject')}
        </Field>
        <Field label="Intermediate milestones" hint="Checkpoints on the way to the output project.">
          <textarea value={data.milestones} onChange={(e) => set('milestones', e.target.value)} />
          {suggestionFor('milestones')}
        </Field>
        <Field label="Resources" hint="Pick at most 5 — more than that is a sign of avoiding the work.">
          <textarea value={data.resources} onChange={(e) => set('resources', e.target.value)} />
          {suggestionFor('resources')}
        </Field>
        <Field label="First action for the next 48 hours" hint="Something small and concrete you can start now.">
          <textarea value={data.firstAction} onChange={(e) => set('firstAction', e.target.value)} />
          {suggestionFor('firstAction')}
        </Field>
        <Field label="Predictable obstacles and responses" hint="What will get in the way, and what you will do about it.">
          <textarea value={data.obstacles} onChange={(e) => set('obstacles', e.target.value)} />
          {suggestionFor('obstacles')}
        </Field>
      </SectionBlock>

      <CriterionBox>
        <strong>Completion criterion:</strong> You have an output project, milestones and a first action you can
        take in the next 48 hours.
      </CriterionBox>

      <div className="stage-actions">
        <SaveButton label="Save Attack Plan" onSave={save} saved={saved} />
      </div>
    </div>
  )
}

export default Plan
