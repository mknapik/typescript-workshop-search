import * as React from 'react'
import { render } from 'react-dom'
import Search from './search'

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
}

const App = () => (
  <div style={styles}>
    <Search name={'search'} />
  </div>
)

render(<App />, document.getElementById('root'))
