import { useState } from 'react'
import { useTopics } from './hooks/useTopics'
import { useSettings } from './hooks/useSettings'
import { STAGES, isStageCompleted, countCompleted } from './stages'
import Diagnosis from './components/Diagnosis'
import Map from './components/Map'
import Plan from './components/Plan'
import Cycles from './components/Cycles'
import Consolidation from './components/Consolidation'

const ProgressBar = ({ done }) => (
  <>
    <span className="progress-bar">
      <span className="progress-fill" style={{ width: `${(done / STAGES.length) * 100}%` }} />
    </span>
    <span className="progress-count">
      {done}/{STAGES.length}
    </span>
  </>
)

const Sidebar = ({ topics, activeId, onSelect, onHome, onNew, onSettings, hasKey }) => (
  <aside className="sidebar">
    <button type="button" className="brand" onClick={onHome}>
      ◈ Learn
    </button>
    <button type="button" className="btn-new" onClick={onNew}>
      + New topic
    </button>
    <nav className="topic-list">
      {topics.map((topic) => (
        <button
          type="button"
          key={topic.id}
          className={`topic-item ${activeId === topic.id ? 'topic-item-active' : ''}`}
          onClick={() => onSelect(topic.id)}
        >
          <span className="topic-item-name">{topic.name}</span>
          <span className="topic-item-meta">
            <ProgressBar done={countCompleted(topic)} />
          </span>
        </button>
      ))}
    </nav>
    <button type="button" className="btn-settings" onClick={onSettings}>
      <span className={`settings-dot ${hasKey ? 'settings-dot-on' : ''}`} />
      AI settings
    </button>
  </aside>
)

const Home = ({ topics, onOpen, onNew }) => (
  <div className="home">
    <div className="hero">
      <h1 className="hero-title">
        Learn any skill,
        <br />
        the deliberate way.
      </h1>
      <p className="hero-sub">
        Five stages, from diagnosis to teaching it back. Create a topic and take it all the way.
      </p>
      <button type="button" className="btn-primary" onClick={onNew}>
        + New topic
      </button>
    </div>

    {topics.length > 0 && (
      <div className="topic-grid">
        {topics.map((topic) => (
          <button type="button" key={topic.id} className="topic-card" onClick={() => onOpen(topic.id)}>
            <h3 className="topic-card-name">{topic.name}</h3>
            <div className="topic-dots">
              {STAGES.map((stage) => (
                <span
                  key={stage.key}
                  className={`dot ${isStageCompleted(topic, stage.key) ? 'dot-done' : ''}`}
                />
              ))}
            </div>
            <div className="topic-card-foot">
              <ProgressBar done={countCompleted(topic)} />
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
)

const StageNav = ({ topic, onSelectStage }) => (
  <nav className="stage-nav">
    {STAGES.map((stage) => {
      const done = isStageCompleted(topic, stage.key)
      const active = stage.num === topic.currentStage
      return (
        <button
          type="button"
          key={stage.key}
          className={`stage-nav-item ${active ? 'stage-nav-active' : ''}`}
          onClick={() => onSelectStage(stage.num)}
        >
          <span
            className={`stage-dot ${done ? 'stage-dot-done' : active ? 'stage-dot-active' : ''}`}
          >
            {done ? '✓' : stage.num}
          </span>
          <span className="stage-nav-text">
            <span className="stage-nav-label">{stage.label}</span>
            <span className="stage-nav-sub">{stage.sub}</span>
          </span>
        </button>
      )
    })}
  </nav>
)

const TopicView = ({ topic, onBack, onDelete, patchStage, addCycle, setCurrentStage, passphrase }) => {
  const stageKey = STAGES.find((stage) => stage.num === topic.currentStage).key
  const update = (patch) => patchStage(topic.id, stageKey, patch)

  const renderStage = () => {
    switch (stageKey) {
      case 'diagnosis':
        return <Diagnosis data={topic.stages.diagnosis} update={update} topic={topic} passphrase={passphrase} />
      case 'map':
        return <Map data={topic.stages.map} update={update} topic={topic} passphrase={passphrase} />
      case 'plan':
        return <Plan data={topic.stages.plan} update={update} topic={topic} passphrase={passphrase} />
      case 'cycles':
        return (
          <Cycles
            cycles={topic.stages.cycles}
            addCycle={(cycle) => addCycle(topic.id, cycle)}
            topic={topic}
            passphrase={passphrase}
          />
        )
      case 'consolidation':
        return <Consolidation data={topic.stages.consolidation} update={update} topic={topic} passphrase={passphrase} />
      default:
        return null
    }
  }

  return (
    <div className="topic-view">
      <header className="topic-header">
        <button type="button" className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <h2 className="topic-header-name">{topic.name}</h2>
        <button type="button" className="btn-ghost btn-danger" onClick={onDelete}>
          Delete
        </button>
      </header>
      <div className="topic-body">
        <StageNav topic={topic} onSelectStage={(num) => setCurrentStage(topic.id, num)} />
        <div className="stage-content">{renderStage()}</div>
      </div>
    </div>
  )
}

const NewTopicModal = ({ onCreate, onClose }) => {
  const [name, setName] = useState('')

  const submit = () => {
    if (name.trim()) onCreate(name.trim())
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">New topic</h3>
        <p className="modal-sub">What skill do you want to learn?</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onClose()
          }}
          placeholder="e.g. Figma, React, photography"
        />
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={submit} disabled={!name.trim()}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

const DeleteModal = ({ topic, onConfirm, onClose }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h3 className="modal-title">Delete topic</h3>
      <p className="modal-sub">
        Delete “{topic.name}”? This action cannot be undone.
      </p>
      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary btn-primary-danger" onClick={onConfirm}>
          Delete
        </button>
      </div>
    </div>
  </div>
)

const AISettingsModal = ({ passphrase, onSave, onClose }) => {
  const [value, setValue] = useState(passphrase)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">AI settings</h3>
        <p className="modal-sub">
          Enter the <code>APP_PASSPHRASE</code> 
        </p>
        <input
          autoFocus
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(value.trim())
            if (e.key === 'Escape') onClose()
          }}
          placeholder="Access passphrase"
        />
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={() => onSave('')}>
            Clear
          </button>
          <button type="button" className="btn-primary" onClick={() => onSave(value.trim())}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  const { topics, createTopic, deleteTopic, patchStage, addCycle, setCurrentStage } = useTopics()
  const { passphrase, setPassphrase } = useSettings()
  const [activeId, setActiveId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const activeTopic = topics.find((topic) => topic.id === activeId) ?? null
  const deletingTopic = topics.find((topic) => topic.id === deleteId) ?? null

  const handleCreate = (name) => {
    setActiveId(createTopic(name))
    setShowNew(false)
  }

  const handleDelete = (id) => {
    deleteTopic(id)
    if (activeId === id) setActiveId(null)
    setDeleteId(null)
  }

  return (
    <div className="app">
      <Sidebar
        topics={topics}
        activeId={activeId}
        onSelect={setActiveId}
        onHome={() => setActiveId(null)}
        onNew={() => setShowNew(true)}
        onSettings={() => setShowSettings(true)}
        hasKey={!!passphrase}
      />
      <main className="main">
        {activeTopic ? (
          <TopicView
            topic={activeTopic}
            onBack={() => setActiveId(null)}
            onDelete={() => setDeleteId(activeTopic.id)}
            patchStage={patchStage}
            addCycle={addCycle}
            setCurrentStage={setCurrentStage}
            passphrase={passphrase}
          />
        ) : (
          <Home topics={topics} onOpen={setActiveId} onNew={() => setShowNew(true)} />
        )}
      </main>

      {showNew && <NewTopicModal onCreate={handleCreate} onClose={() => setShowNew(false)} />}
      {showSettings && (
        <AISettingsModal
          passphrase={passphrase}
          onSave={(value) => {
            setPassphrase(value)
            setShowSettings(false)
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {deletingTopic && (
        <DeleteModal
          topic={deletingTopic}
          onConfirm={() => handleDelete(deletingTopic.id)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}

export default App
