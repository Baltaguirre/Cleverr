import { StageHeader, SectionBlock, Field, CriterionBox, SaveButton } from './ui'
import { useSaveFeedback } from '../hooks/useSaveFeedback'

const Plan = ({ data, update }) => {
  const [saved, triggerSave] = useSaveFeedback()
  const set = (field, value) => update({ [field]: value })

  const save = () => {
    update({ completed: true })
    triggerSave()
  }

  return (
    <div className="stage">
      <StageHeader number="3" title="Attack Plan" subtitle="How you will attack it" />

      <SectionBlock title="Planning the attack">
        <Field label="Output project" hint="The concrete thing you will build to prove you learned it.">
          <textarea value={data.outputProject} onChange={(e) => set('outputProject', e.target.value)} />
        </Field>
        <Field label="Intermediate milestones" hint="Checkpoints on the way to the output project.">
          <textarea value={data.milestones} onChange={(e) => set('milestones', e.target.value)} />
        </Field>
        <Field label="Resources" hint="Pick at most 5 — more than that is a sign of avoiding the work.">
          <textarea value={data.resources} onChange={(e) => set('resources', e.target.value)} />
        </Field>
        <Field label="First action for the next 48 hours" hint="Something small and concrete you can start now.">
          <textarea value={data.firstAction} onChange={(e) => set('firstAction', e.target.value)} />
        </Field>
        <Field label="Predictable obstacles and responses" hint="What will get in the way, and what you will do about it.">
          <textarea value={data.obstacles} onChange={(e) => set('obstacles', e.target.value)} />
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
