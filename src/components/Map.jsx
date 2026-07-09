import { StageHeader, SectionBlock, Field, CriterionBox, SaveButton } from './ui'
import { useSaveFeedback } from '../hooks/useSaveFeedback'

const Map = ({ data, update }) => {
  const [saved, triggerSave] = useSaveFeedback()
  const set = (field, value) => update({ [field]: value })

  const save = () => {
    update({ completed: true })
    triggerSave()
  }

  return (
    <div className="stage">
      <StageHeader number="2" title="Territory Map" subtitle="The territory of the skill" />

      <SectionBlock title="Mapping the territory">
        <Field label="Key concepts" hint="The core ideas you will need to master.">
          <textarea value={data.keyConcepts} onChange={(e) => set('keyConcepts', e.target.value)} />
        </Field>
        <Field
          label="Dependencies between concepts"
          hint="What builds on what? Use a format like A → B → C."
        >
          <textarea value={data.dependencies} onChange={(e) => set('dependencies', e.target.value)} />
        </Field>
        <Field label="In scope / out of scope" hint="What you will focus on now, and what you deliberately skip.">
          <textarea value={data.inScope} onChange={(e) => set('inScope', e.target.value)} />
        </Field>
        <Field label="Critical gaps" hint="Where are the holes that would block your progress?">
          <textarea value={data.gaps} onChange={(e) => set('gaps', e.target.value)} />
        </Field>
        <Field label="Reference sources" hint="Docs, courses, books, people worth following.">
          <textarea value={data.sources} onChange={(e) => set('sources', e.target.value)} />
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
