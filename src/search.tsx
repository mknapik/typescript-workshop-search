import * as React from 'react'
import axios from 'axios'

interface Props {
  name: string
}

class Search extends React.Component<Props> {
  state: {
    results: string[],
    error?: string
  }
  onChange: (searchTerm: string) => void

  constructor (props: Props) {
    super(props)

    this.state = {
      results: []
    }

    this.onChange = (searchTerm: string) => {
      axios
        .get('https://en.wikipedia.org/w/api.php', {
          params: {
            action: 'opensearch',
            format: 'json',
            search: searchTerm,
            origin: '*',
          },
        })
        .then(({data: [, results, ]}) => {
          this.setState({
            results
          })
        }, error => {
          this.setState({
            results: [],
            error: error,
          })
        })
    }
  }

  render () {
    const { props, state: { results } } = this
    return (
      <div className="container">
        <div className="row-fluid">
          <form role="form">
            <div className="form-group">
              <input
                type="text"
                id="textInput"
                className="form-control"
                onChange={event => this.onChange(event.target.value)}
                placeholder="Enter Query..."
              />
            </div>
          </form>
        </div>
        <div className="row-fluid">
          <ul id="results" />
          {
            results.map((result, index) => (
              <li key={index}>{result}</li>
            ))
          }
        </div>
      </div>
    )
  }
}

export default Search
