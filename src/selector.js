class Selector {
  constructor(state, path) {
    this.state = state;
    this.path = path;
  }

  attr(attributeName) {
    return this.state.getIn(this.path.concat(['attributes', attributeName]));
  }
}

export default function(state, path) {
  return new Selector(state, path);
}
