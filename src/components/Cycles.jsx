import { useState } from 'react'
import { StageHeader, SectionBlock, Field, CriterionBox, SuggestBar, CoachingPanel } from './ui'
import { useGeneration } from '../hooks/useGeneration'

const EMPTY_FORM = {
  acquired: '',
  practiced: '',
  broke: '',
  reflection: '',
  discoveredLimitation: '',
  nextCycle: '',
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const CycleRow = ({ label, value }) =>
  value ? (
    <div className="cycle-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  ) : null

const Cycles = ({ cycles, addCycle, topic, passphrase }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedId, setExpandedId] = useState(null)
  const gen = useGeneration('cycles', () => topic, passphrase)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const canSave = Object.values(form).some((value) => value.trim() !== '')

  const submit = () => {
    if (!canSave) return
    addCycle({ id: crypto.randomUUID(), date: new Date().toISOString(), ...form })
    setForm(EMPTY_FORM)
  }

  // Most recent cycle first, without mutating the original array (ES2023).
  const reversed = cycles.toReversed()

  return (
    <div className="stage">
      <StageHeader number="4" title="Execution Cycle" subtitle="Acquire · Practice · Break · Reflect" />

      <SuggestBar
        label="💡 Coaching for this cycle"
        onSuggest={gen.run}
        loading={gen.loading}
        error={gen.error}
        disabled={!passphrase}
        disabledHint="Add your access passphrase in AI settings to enable."
      />
      {gen.coaching && <CoachingPanel text={gen.coaching} onClose={() => gen.setCoaching('')} />}

      <SectionBlock title="New cycle">
        <Field label="What did you acquire?" hint="New knowledge, technique or concept from this cycle.">
          <textarea value={form.acquired} onChange={(e) => set('acquired', e.target.value)} />
        </Field>
        <Field label="How did you practice it?">
          <textarea value={form.practiced} onChange={(e) => set('practiced', e.target.value)} />
        </Field>
        <Field
          label="What did you intentionally break?"
          hint="Pushing past the limits is how you find where the edges are."
        >
          <textarea value={form.broke} onChange={(e) => set('broke', e.target.value)} />
        </Field>
        <Field label="Reflection">
          <textarea value={form.reflection} onChange={(e) => set('reflection', e.target.value)} />
        </Field>
        <Field label="Limitation discovered" hint="The most valuable output of the cycle.">
          <input
            value={form.discoveredLimitation}
            onChange={(e) => set('discoveredLimitation', e.target.value)}
          />
        </Field>
        <Field label="Input for the next cycle">
          <input value={form.nextCycle} onChange={(e) => set('nextCycle', e.target.value)} />
        </Field>
        <div className="stage-actions">
          <button type="button" className="btn-save" onClick={submit} disabled={!canSave}>
            Add cycle
          </button>
        </div>
      </SectionBlock>

      {reversed.length > 0 && (
        <div className="cycle-history">
          <div className="cycle-history-title">
            History · {cycles.length} {cycles.length === 1 ? 'cycle' : 'cycles'}
          </div>
          {reversed.map((cycle, index) => {
            const number = cycles.length - index
            const open = expandedId === cycle.id
            return (
              <div key={cycle.id} className={`cycle-card ${open ? 'cycle-open' : ''}`}>
                <button
                  type="button"
                  className="cycle-card-head"
                  onClick={() => setExpandedId(open ? null : cycle.id)}
                >
                  <span className="cycle-badge">#{number}</span>
                  <span className="cycle-summary">{cycle.acquired || '—'}</span>
                  <span className="cycle-date">{formatDate(cycle.date)}</span>
                  <span className="cycle-chevron">{open ? '▾' : '▸'}</span>
                </button>
                {cycle.discoveredLimitation && (
                  <div className="cycle-pill">Limitation: {cycle.discoveredLimitation}</div>
                )}
                {open && (
                  <div className="cycle-detail">
                    <CycleRow label="Acquired" value={cycle.acquired} />
                    <CycleRow label="Practiced" value={cycle.practiced} />
                    <CycleRow label="Broke intentionally" value={cycle.broke} />
                    <CycleRow label="Reflection" value={cycle.reflection} />
                    <CycleRow label="Input for next cycle" value={cycle.nextCycle} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <CriterionBox>
        <strong>Completion criterion:</strong> You have run at least one cycle and captured the limitation it
        revealed.
      </CriterionBox>
    </div>
  )
}

export default Cycles
