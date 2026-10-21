const Persons = ({ persons, onDelete, disabled }) => (
  <ul>{persons.map(person => (
    <li key={person.id}>
      {person.name} {person.number}{' '}
      <button onClick={() => onDelete(person)} disabled={disabled} aria-label={`delete ${person.name}`}>delete</button>
    </li>
  ))}</ul>
)
export default Persons
