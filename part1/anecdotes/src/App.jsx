import { useState } from 'react'

// Original study examples; not copied from the sample quotation collection.
const anecdotes = [
  'A failing test is a useful clue, not a verdict on the programmer.',
  'A small reproducible example can explain more than a long bug report.',
  'The best variable name tells the next reader why the value matters.',
  'Make the next change easier while solving the current problem.',
  'A deployment is only finished when the user can use the feature.',
  'An assumption becomes safer when you can test it.',
  'Choose the simplest design that makes the requirements clear.',
  'Readable code is a conversation with your future teammates.',
]

const Anecdote = ({ text, votes }) => (
  <section>
    <p>{text}</p>
    <p>has {votes} votes</p>
  </section>
)

const App = () => {
  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(() => Array(anecdotes.length).fill(0))
  const mostVoted = votes.indexOf(Math.max(...votes))

  const vote = () => {
    setVotes(previous => {
      const updated = [...previous]
      updated[selected] += 1
      return updated
    })
  }

  const nextAnecdote = () => {
    setSelected(Math.floor(Math.random() * anecdotes.length))
  }

  return (
    <main>
      <h1>Anecdote of the day</h1>
      <Anecdote text={anecdotes[selected]} votes={votes[selected]} />
      <button onClick={vote}>vote</button>{' '}
      <button onClick={nextAnecdote}>next anecdote</button>
      <h2>Anecdote with most votes</h2>
      <Anecdote text={anecdotes[mostVoted]} votes={votes[mostVoted]} />
    </main>
  )
}

export default App
