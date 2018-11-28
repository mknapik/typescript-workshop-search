import * as React from 'react'
import { from, Subject } from 'rxjs'
import axios from 'axios'
import { debounceTime, distinctUntilChanged, filter, map, mergeMap } from 'rxjs/internal/operators'

interface Props {
  name: string
}

class Search extends React.Component<Props> {
  event$: Subject<string>
  state: {
    results: string[],
    error?: string
  }
  onChange: (searchTerm: string) => void

  constructor (props: Props) {
    super(props)

    this.event$ = new Subject<string>()
    this.state = {
      results: []
    }

    this.onChange = (searchTerm: string) => {
      this.event$.next(searchTerm)
    }

    this.event$.pipe(
      filter(term => term.length > 2),
      debounceTime(750),
      distinctUntilChanged(),
      mergeMap(term =>
        from(axios
          .get('https://en.wikipedia.org/w/api.php', {
            params: {
              action: 'opensearch',
              format: 'json',
              search: term,
              origin: '*',
            },
          })).pipe(
          map(response => response.data),
        ),
      ),
    ).subscribe(
      ([, articles]) => {
        console.log(articles)
        this.setState({
          results: articles
        })
      },
      error => {
        console.error('error', error)
        this.setState({
          results: [],
          error: error,
        })
      },
    )
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
