import { StageHeader, SectionBlock, Field, CriterionBox, SaveButton, SuggestBar, SuggestionCard } from './ui'
import { useSaveFeedback } from '../hooks/useSaveFeedback'
import { useGeneration } from '../hooks/useGeneration'

const Map = ({ data, update, topic, passphrase }) => {
  const [saved, triggerSave] = useSaveFeedback()
  const gen = useGeneration('map', () => topic, passphrase)
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
      <StageHeader number="2" title="Territory Map" subtitle="The territory of the skill" />

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

      <SectionBlock title="Mapping the territory">
        <Field label="Key concepts" hint="The core ideas you will need to master.">
          <textarea value={data.keyConcepts} onChange={(e) => set('keyConcepts', e.target.value)} />
          {suggestionFor('keyConcepts')}
        </Field>
        <Field
          label="Dependencies between concepts"
          hint="What builds on what? Use a format like A → B → C."
        >
          <textarea value={data.dependencies} onChange={(e) => set('dependencies', e.target.value)} />
          {suggestionFor('dependencies')}
        </Field>
        <Field label="In scope / out of scope" hint="What you will focus on now, and what you deliberately skip.">
          <textarea value={data.inScope} onChange={(e) => set('inScope', e.target.value)} />
          {suggestionFor('inScope')}
        </Field>
        <Field label="Critical gaps" hint="Where are the holes that would block your progress?">
          <textarea value={data.gaps} onChange={(e) => set('gaps', e.target.value)} />
          {suggestionFor('gaps')}
        </Field>
        <Field label="Reference sources" hint="Docs, courses, books, people worth following.">
          <textarea value={data.sources} onChange={(e) => set('sources', e.target.value)} />
          {suggestionFor('sources')}
        </Field>
      </SectionBlock>

      <CriterionBox>
        <strong>Completion criterion:</strong> You can see the whole territory — key concepts, their
        dependencies and where your critical gaps are.
      </CriterionBox>

      <div className="stage-actions">
        <SaveButton label="Save Territory Map" onSave={save} saved={saved} />
      </div>
    </div>
  )
}

export default Map
