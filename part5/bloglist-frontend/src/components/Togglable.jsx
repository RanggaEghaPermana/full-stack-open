import { useImperativeHandle, useState } from 'react'
export default function Togglable({ buttonLabel, children, ref }) {
  const [visible, setVisible] = useState(false)
  useImperativeHandle(ref, () => ({ hide: () => setVisible(false) }), [])
  return <section>
    {!visible && <button onClick={() => setVisible(true)}>{buttonLabel}</button>}
    <div hidden={!visible}>{children}<button type="button" onClick={() => setVisible(false)}>cancel</button></div>
  </section>
}
