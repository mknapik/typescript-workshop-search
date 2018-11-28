import * as React from 'react'
import axios from 'axios'
import { from, of, Subject } from 'rxjs/index'
import { debounceTime, distinctUntilChanged, filter, map, mergeMap } from 'rxjs/internal/operators'

interface Props {
  name: string
}

interface State {
  results: string[],
  error?: string
}

function fetch (term: string) {
  return from(axios
    .get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'opensearch',
        format: 'json',
        search: term,
        origin: '*',
      },
    }))
}

class Search extends React.Component<Props, State> {
  events: Subject<string>
  state: {
    results: string[],
    error?: string
  }
  onChange: (searchTerm: string) => void

  constructor (props: Props) {
    super(props)

    this.state = {
      results: [],
    }

    this.events = new Subject<string>()

    this.onChange = (searchTerm: string) => {
      this.events.next(searchTerm)
    }

    const debouncedSearchTerms = this.events
      .pipe(
        filter(value => value !== ' '),
        debounceTime(500),
        distinctUntilChanged(),
        mergeMap(term =>
          !!term
            ? of(term)
              .pipe(
                mergeMap(fetch),
                map(({ data: [first, results, ...tail] }) => results),
              )
            : of([]),
        )
      )

    debouncedSearchTerms
      .subscribe({
        next: results => this.setState({ results }),
        error: error => this.setState({ results: [], error }),
      })
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
