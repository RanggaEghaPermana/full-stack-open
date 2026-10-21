import styled from 'styled-components'
export const Navigation = styled.nav`
  display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
  background: #172f46; color: white; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;
  a { color: white; text-decoration: none; padding: 6px 10px; border-radius: 5px; }
  a[aria-current='page'] { background: #31516d; }
  .session { margin-left: auto; font-size: .9rem; }
`
export const FormSurface = styled.section`
  form { background: white; padding: 24px; border: 1px solid #d2dde5; border-radius: 12px; }
  input { width: 100%; max-width: none; border: 1px solid #8b9dab; border-radius: 6px; padding: 10px; }
  button[type='submit'] { background: #1e587e; color: white; border-color: #1e587e; min-width: 110px; }
`
export const Notice = styled.div`
  border-left: 5px solid ${p => p.$error ? '#a72d35' : '#20734c'};
  background: ${p => p.$error ? '#fff0f1' : '#e7f6ee'};
  color: ${p => p.$error ? '#8c242c' : '#155c3b'};
  border-radius: 6px; padding: 12px 16px; margin: 18px 0;
`
