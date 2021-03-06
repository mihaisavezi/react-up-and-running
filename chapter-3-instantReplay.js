// 20170525131808
// https://raw.githubusercontent.com/tamingtext/book/master/apache-solr/example/exampledocs/books.json

var headers = [
  "Book", "Author", "Language", "Published", "Sales"
];

var data = [
  ["The Lightning Thief", "Rick Riordan", "en", "1954-1955", "150 Million"],
  ["The Sea of Monsters", "Jostein Gaarder", "en", "1954-1955", "50 Million"],
  ["Lucene in Action ", "Lucene Grebla", "en", "1954-1999", "150 Million"]
];

var Excel = React.createClass({
  displayName: 'Excel',

  _preSearchData: null,
  _searchData: null,

  _log: [],
  _logSetState: function (newState) {
    this._log.push(JSON.parse(JSON.stringify(
      this._log.length === 0 ? this.state : newState
    )));
    this.setState(newState);
  },
  propTypes: {
    headers: React.PropTypes.arrayOf(React.PropTypes.string),
    initialData: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(
        React.PropTypes.string
      )
    ),
  },

  componentDidMount: function () {
    document.onkeydown = function (e) {
      if (e.altKey && e.shiftKey && e.keyCode === 82) { // ALT+SHIFT+R
        this._replay();
      }
    }.bind(this);
  },

  _replay: function() {
    if(this._log.length === 0) {
      console.warn('No state to replay yet');
      return;
    }

    var idx = -1;
    var interval = setInterval(function() {
      idx++;
      if (idx === this._log.length -1) {
        clearInterval(interval);
      }
      this.setState(this._log[idx]);
    }.bind(this), 1000)
  },

  getInitialState: function () {
    return {
      data: this.props.initialData,
      sortby: null,
      descending: false,
      edit: null,
      search: false
    };
  },

  _sort: function (e) {
    var column = e.target.cellIndex;
    var data = this.state.data.slice(); // copy of data; 
    var descending = this.state.sortby === column && !this.state.descending;

    data.sort(function (a, b) {
      return descending
        ? (a[column] < b[column] ? 1 : -1)
        : (a[column] > b[column] ? 1 : -1);
    });
    this._logSetState({
      data: data,
      sortby: column,
      descending: descending
    });
  },

  _toggleSearch: function () {
    if (this.state.search) {
      this._logSetState({
        data: this._preSearchData,
        search: false,
      });
      this._preSearchData = null;
      this._searchData = null;
    }
    else {
      this._preSearchData = this.state.data;
      this._logSetState({
        search: true
      })
    }
  },

  _showEditor: function (e) {
    console.log('enables the editor');
    this._logSetState({
      edit: {
        row: parseInt(e.target.dataset.row, 10),
        cell: e.target.cellIndex
      }
    })
  },

  _save: function (e) {
    e.preventDefault();

    var input = e.target.firstChild;
    var data = this.state.data.slice();
    data[this.state.edit.row][this.state.edit.cell] = input.value;

    this._logSetState({
      edit: null,
      data: data,
    });
    console.log('saving edits');
  },

  _search: function (e) {
    var needle = e.target.value.toLowerCase();

    // if empty search revert to data pre search
    if (!needle) {
      this._logSetState({
        data: this._preSearchData
      });
      return
    }

    var idx = e.target.dataset.idx;
    this._searchData = this._searchData ? this._searchData : this._preSearchData;

    this._searchData = this._searchData.filter(function (row) {
      return row[idx].toString().toLowerCase().indexOf(needle) > -1;
    });

    this._logSetState({ data: this._searchData });
  },

  _renderSearch: function () {
    if (!this.state.search) {
      return null;
    }
    return (
      React.DOM.tr({ onChange: this._search },
        this.props.headers.map(function (_ignore, idx) {
          return React.DOM.td({ key: idx },
            React.DOM.input({
              type: 'text',
              'data-idx': idx
            })
          )
        })
      )
    );
  },

  _renderToolbar: function () {
    return React.DOM.button(
      {
        onClick: this._toggleSearch,
        className: 'toolbar'
      },
      this.state.search ? 'done searching' : 'search'
    );
  },

  _renderTable: function () {
    return (
      React.DOM.table(null,
        React.DOM.thead({ onClick: this._sort },
          React.DOM.tr(null,
            this.props.headers.map(function (title, idx) {
              if (this.state.sortby === idx) {
                title += this.state.descending ? ' \u2191' : ' \u2193';
              }

              return React.DOM.th({ key: idx }, title);
            }, this)
          )
        ),
        React.DOM.tbody({ onDoubleClick: this._showEditor },
          this._renderSearch(),
          this.state.data.map(function (row, rowidx) {
            return (
              React.DOM.tr({ key: rowidx },
                row.map(function (cell, idx) {
                  var content = cell;
                  var edit = this.state.edit;

                  if (edit && edit.row === rowidx && edit.cell === idx) {
                    console.log('allow item to be edited');
                    content = React.DOM.form({ onSubmit: this._save },
                      React.DOM.input({
                        type: 'text',
                        defaultValue: content
                      })
                    );
                  }


                  return React.DOM.td({
                    key: idx,
                    'data-row': rowidx
                  }, content);
                }, this)
              )
            );
          }, this)
        )
      )
    )
  },

  render: function () {
    return (
      React.DOM.div(null,
        this._renderToolbar(),
        this._renderTable()
      )
    )
  }
});

ReactDOM.render(
  React.createElement(Excel, {
    headers: headers,
    initialData: data,
    sortby: null,
    descending: false,
    edit: null
  }),
  document.getElementById("container")
);