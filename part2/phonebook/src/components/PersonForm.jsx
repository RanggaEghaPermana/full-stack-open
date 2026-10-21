const PersonForm = ({ name, number, onNameChange, onNumberChange, onSubmit, disabled }) => (
  <form onSubmit={onSubmit}>
    <div><label>name: <input value={name} onChange={onNameChange} required disabled={disabled} /></label></div>
    <div><label>number: <input value={number} onChange={onNumberChange} required disabled={disabled} /></label></div>
    <button type="submit" disabled={disabled}>add</button>
  </form>
)
export default PersonForm
