import { useState, useEffect } from 'react'
import { loadTopics, saveTopics } from '../utils/storage'

// Factory for a brand-new topic with every stage initialised empty.
const createEmptyTopic = (id, name) => ({
  id,
  name,
  createdAt: new Date().toISOString(),
  currentStage: 1,
  stages: {
    diagnosis: {
      completed: false,
      topic: name[0].toUpperCase() + name.slice(1),
      currentAbility: '',
      level: '',
      goal: '',
      successCriterion: '',
      project: '',
      motivation: '',
      styles: [],
      time: '',
      deadline: '',
    },
    map: {
      completed: false,
      keyConcepts: '',
      dependencies: '',
      inScope: '',
      gaps: '',
      sources: '',
    },
    plan: {
      completed: false,
      outputProject: '',
      milestones: '',
      resources: [],
      firstAction: '',
      obstacles: '',
    },
    cycles: [],
    consolidation: {
      completed: false,
      criterionAchieved: '',
      processLearnings: '',
      connections: '',
      openQuestions: '',
      howYouWouldTeach: '',
    },
  },
})

// Single source of truth for topics. State is mirrored to localStorage on every
// change so navigating between stages never loses data.
export const useTopics = () => {
  const [topics, setTopics] = useState(loadTopics)

  useEffect(() => {
    saveTopics(topics)
  }, [topics])

  const createTopic = (name) => {
    const id = crypto.randomUUID()
    setTopics((prev) => [...prev, createEmptyTopic(id, name[0].toUpperCase() + name.slice(1))])
    return id
  }

  const deleteTopic = (id) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== id))
  }

  const patchStage = (id, stageKey, patch) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === id
          ? {
              ...topic,
              stages: {
                ...topic.stages,
                [stageKey]: { ...topic.stages[stageKey], ...patch },
              },
            }
          : topic,
      ),
    )
  }

  const addCycle = (id, cycle) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === id
          ? { ...topic, stages: { ...topic.stages, cycles: [...topic.stages.cycles, cycle] } }
          : topic,
      ),
    )
  }

  const setCurrentStage = (id, stage) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === id ? { ...topic, currentStage: stage } : topic)),
    )
  }

  const getTopic = (id) => {
    return topics.find((topic) => topic.id === id)
  }
  return { topics, createTopic, deleteTopic, patchStage, addCycle, setCurrentStage, getTopic }
}
