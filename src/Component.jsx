import React from 'react';

export default React.createClass({
  render() {
    if (this.props.onRender) {
      this.props.onRender();
    }
    return <p>Hello world</p>;
  },
  propTypes: {
    onRender: React.PropTypes.func
  }
});
