// Reusable UI primitives shared by every stage component.

// The signature visual element: a large 72px stage number anchoring each stage.
export const StageHeader = ({ number, title, subtitle }) => (
  <div className="stage-header">
    <span className="stage-number">{number}</span>
    <div className="stage-heading">
      <h2 className="stage-title">{title}</h2>
      {subtitle && <p className="stage-subtitle">{subtitle}</p>}
    </div>
  </div>
)

export const SectionBlock = ({ tag, title, children }) => (
  <div className="section-block">
    <div className="section-header">
      {tag && <span className="section-tag">{tag}</span>}
      <span>{title}</span>
    </div>
    <div className="section-body">{children}</div>
  </div>
)

export const Field = ({ label, hint, children }) => (
  <div className="field">
    {label && <label>{label}</label>}
    {hint && <p className="field-hint">{hint}</p>}
    {children}
  </div>
)

// Selector chips. Single-select behaves like a radio; multi-select toggles.
export const Chips = ({ options, value, onChange, multi = false }) => {
  const isActive = (v) => (multi ? value.includes(v) : value === v)

  const handleClick = (v) => {
    if (multi) {
      onChange(value.includes(v) ? value.filter((item) => item !== v) : [...value, v])
    } else {
      onChange(v)
    }
  }

  return (
    <div className="chips">
      {options.map((option) => (
        <button
          type="button"
          key={option.v}
          className={`chip ${isActive(option.v) ? 'chip-active' : ''}`}
          onClick={() => handleClick(option.v)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export const CriterionBox = ({ children }) => (
  <div className="criterion-box">
    <span className="criterion-icon">✓</span>
    <p>{children}</p>
  </div>
)

export const Warning = ({ children }) => <div className="warning">⚠ {children}</div>

export const SaveButton = ({ label, onSave, saved }) => (
  <button type="button" className={`btn-save ${saved ? 'btn-saved' : ''}`} onClick={onSave}>
    {saved ? '✓ Saved' : label}
  </button>
)
