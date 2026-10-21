import Weather from './Weather.jsx'
const Country = ({ country }) => (
  <section>
    <h1>{country.name.common}</h1>
    <p>capital {country.capital?.join(', ') || 'Not available'}</p>
    <p>area {country.area} km²</p>
    <h2>languages</h2>
    <ul>{Object.entries(country.languages || {}).map(([code, name]) => <li key={code}>{name}</li>)}</ul>
    <img src={country.flags.svg || country.flags.png} alt={country.flags.alt || `Flag of ${country.name.common}`} width="200" />
    <Weather key={country.cca3} country={country} />
  </section>
)
export default Country
