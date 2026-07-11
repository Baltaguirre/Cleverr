import { useState } from 'react'
import { StageHeader, SectionBlock, Field, CriterionBox, SaveButton, SuggestBar, SuggestionCard } from './ui'
import { useSaveFeedback } from '../hooks/useSaveFeedback'
import { useGeneration } from '../hooks/useGeneration'
import { generateStage } from '../lib/generate'

// Give each drafted resource a stable id so a card's summary can be written
// back to the right entry once it's generated.
const normalizeResources = (list) =>
  (Array.isArray(list) ? list : []).map((r) => ({
    id: crypto.randomUUID(),
    title: r.title || '',
    note: r.note || '',
  }))

// One resource, collapsed to its title + note. Opening it lazily generates an
// AI summary of what to take from the source (cached back into the topic so it
// only ever costs one call per card).
const ResourceCard = ({ resource, topic, passphrase, onUpdate }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSummary = async () => {
    if (loading) return
    if (!passphrase) {
      setError('Add your access passphrase in AI settings to generate summaries.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generateStage('resource', topic, passphrase, {
        resource: { title: resource.title, note: resource.note },
      })
      onUpdate(resource.id, {
        summary: data.fields.summary,
        digDeeper: data.fields.digDeeper,
        recommendations: data.fields.recommendations || [],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = () => {
    const next = !open
    setOpen(next)
    // Only auto-generate the first time a card is opened; later opens reuse the
    // cached summary. Use Regenerate to refresh it.
    if (next && !resource.summary) fetchSummary()
  }

  return (
    <div className={`resource-card ${open ? 'resource-card-open' : ''}`}>
      <button type="button" className="resource-card-head" onClick={toggle}>
        <span className="resource-card-title">{resource.title}</span>
        <span className="resource-card-chevron">{open ? '−' : '+'}</span>
      </button>
      {resource.note && <p className="resource-card-note">{resource.note}</p>}
      {open && (
        <div className="resource-card-body">
          {loading && <p className="resource-card-status">✨ Summarizing…</p>}
          {error && <p className="resource-card-error">⚠ {error}</p>}
          {resource.summary && <p className="resource-card-summary">{resource.summary}</p>}
          {resource.summary && resource.digDeeper && (
            <p className="resource-card-dig">📖 Dig deeper: {resource.digDeeper}</p>
          )}
          {resource.recommendations?.length > 0 && (
            <div className="resource-card-recs">
              <p className="resource-card-recs-label">▶ Watch &amp; follow</p>
              <ul className="resource-card-rec-list">
                {resource.recommendations.map((rec, i) => (
                  <li key={i}>
                    <a
                      className="resource-card-rec-link"
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        rec.query || rec.name,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {rec.name}
                    </a>
                    {rec.note && <span className="resource-card-rec-note"> — {rec.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resource.summary && !loading && (
            <button type="button" className="resource-card-regen" onClick={fetchSummary}>
              ↻ Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const Plan = ({ data, update, topic, passphrase }) => {
  const [saved, triggerSave] = useSaveFeedback()
  const gen = useGeneration('plan', () => topic, passphrase)
  const set = (field, value) => update({ [field]: value })

  const resources = Array.isArray(data.resources) ? data.resources : []
  const legacyResources = typeof data.resources === 'string' ? data.resources.trim() : ''
  const resourceSuggestion = Array.isArray(gen.suggestions?.resources) ? gen.suggestions.resources : null

  const accept = (field) => {
    set(field, gen.suggestions[field])
    gen.dismiss(field)
  }
  const acceptResources = () => {
    set('resources', normalizeResources(gen.suggestions.resources))
    gen.dismiss('resources')
  }
  const acceptAll = () => {
    Object.entries(gen.suggestions).forEach(([field, value]) =>
      set(field, field === 'resources' ? normalizeResources(value) : value),
    )
    gen.clearSuggestions()
  }

  const updateResource = (id, patch) =>
    set('resources', resources.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  // Resources render as cards, not a textarea, so skip them in the generic helper.
  const suggestionFor = (field) =>
    field !== 'resources' && gen.suggestions?.[field] ? (
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
        <Field label="Resources" hint="At most 5 — open a card to get an AI summary of what to take from it.">
          {resourceSuggestion && (
            <div className="suggestion-card">
              <div className="suggestion-label">✨ Suggested resources</div>
              <ul className="resource-suggest-list">
                {resourceSuggestion.map((r, i) => (
                  <li key={i}>
                    <strong>{r.title}</strong>
                    {r.note ? ` — ${r.note}` : ''}
                  </li>
                ))}
              </ul>
              <div className="suggestion-actions">
                <button type="button" className="btn-mini btn-mini-accent" onClick={acceptResources}>
                  Accept
                </button>
                <button type="button" className="btn-mini" onClick={() => gen.dismiss('resources')}>
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {resources.length > 0 ? (
            <div className="resource-cards">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  topic={topic}
                  passphrase={passphrase}
                  onUpdate={updateResource}
                />
              ))}
            </div>
          ) : (
            !resourceSuggestion && (
              <p className="field-hint">
                {legacyResources || 'No resources yet — use “Draft with AI” to generate them.'}
              </p>
            )
          )}
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
