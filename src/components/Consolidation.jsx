import { StageHeader, SectionBlock, Field, CriterionBox, SaveButton } from './ui'
import { useSaveFeedback } from '../hooks/useSaveFeedback'

const Consolidation = ({ data, update }) => {
  const [saved, triggerSave] = useSaveFeedback()
  const set = (field, value) => update({ [field]: value })

  const save = () => {
    update({ completed: true })
    triggerSave()
  }

  return (
    <div className="stage">
      <StageHeader number="5" title="Consolidation" subtitle="Lock in what you learned" />

      <SectionBlock title="Consolidating what you learned">
        <Field label="Criterion achieved" hint="Yes or no, plus the evidence that backs it up.">
          <textarea value={data.criterionAchieved} onChange={(e) => set('criterionAchieved', e.target.value)} />
        </Field>
        <Field label="Learnings from the process" hint="What surprised you about how you learned this?">
          <textarea value={data.processLearnings} onChange={(e) => set('processLearnings', e.target.value)} />
        </Field>
        <Field label="Connections with other fields" hint="Where else does this knowledge apply?">
          <textarea value={data.connections} onChange={(e) => set('connections', e.target.value)} />
        </Field>
        <Field label="Open questions for the next iteration" hint="What would you explore if you kept going?">
          <textarea value={data.openQuestions} onChange={(e) => set('openQuestions', e.target.value)} />
        </Field>
        <Field label="How you would teach it in 10 minutes" hint="The ultimate test of understanding.">
          <textarea value={data.howYouWouldTeach} onChange={(e) => set('howYouWouldTeach', e.target.value)} />
        </Field>
      </SectionBlock>

      <CriterionBox>
        <strong>Completion criterion:</strong> You can teach the core of this skill in 10 minutes and know what
        you would explore next.
      </CriterionBox>

      <div className="stage-actions">
        <SaveButton label="Save Consolidation" onSave={save} saved={saved} />
      </div>
    </div>
  )
}

export default Consolidation
