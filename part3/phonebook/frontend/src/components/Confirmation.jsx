const Confirmation = ({ pending, onConfirm, onCancel, disabled }) => pending ? (
  <section role="alertdialog" aria-label="Confirm phonebook change" aria-describedby="confirmation-message">
    <p id="confirmation-message">{pending.type === 'delete'
      ? `Delete ${pending.person.name}?`
      : `${pending.person.name} is already added to the phonebook. Replace the old number with ${pending.number}?`}</p>
    <button onClick={onConfirm} disabled={disabled}>Confirm</button>{' '}
    <button onClick={onCancel} disabled={disabled}>Cancel</button>
  </section>
) : null
export default Confirmation
