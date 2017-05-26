// Run code from https://jsfiddle.net/reactjs/5vjqabv3/


// Mixin to help with logging
var logMixin = {
  _log: function(methodName, args) {
    console.log(this.name + '::' + methodName, args);
  },

  componentWillUpdate: function() {
    this._log('componentWillUpdate', arguments);
  },

  componentDidUpdate: function() {
    this._log('componentDidUpdate', arguments);
  },

  componentWillMount: function() {
    this._log('componentWillMount', arguments);
  },

  componentDidMount: function() {
    this._log('componentDidMount', arguments);
  },

  componentWillUnmount: function() {
    this._log('componentWillUnmount', arguments);
  },
}


var Counter = React.createClass({
	name: 'Counter',
    // PureRenderMixin - makes sure oldState is different from newState
  mixins: [logMixin, React.addons.PureRenderMixin], 
  propTypes: {
  	count: React.PropTypes.number.isRequired,
  },
  
  render: function() {
  	//console.log(this.name + '::render()');
  	return React.DOM.span(null, this.props.count);
  }
});


var TextAreaCounter = React.createClass({
	name: 'TextAreaCounter',
  mixins: [logMixin],
  getInitialState: function() {
    return {
      text: this.props.text
    };
  },

  _textChange: function(ev) {
    this.setState({
      text: ev.target.value
    });
  },

  // handle outside intrusion via lifecycle method
  // if we change manually the props and want to update the UI
  componentWillReceiveProps: function(newProps) {
    this.setState({
      text: newProps.defaultValue
    });
  },

  render: function() {
  	var counter = null;
    //console.log(this.name + '::render()');

    // show counter component based on state
    if(this.state.text.length > 0) {
    	counter = React.DOM.h3(null, 
      	React.createElement(Counter, {
        	count: this.state.text.length,
        })
      );
    }
    
    return React.DOM.div(null,
      React.DOM.textarea({
        value: this.state.text,
        onChange: this._textChange,
      }),
      counter
    );
  }
});

ReactDOM.render(
  React.createElement(TextAreaCounter, {
    text: 'dfsgfd'
  }),
  document.getElementById('container')
);
