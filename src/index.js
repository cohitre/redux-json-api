import Immutable from 'immutable';
import React from 'react/addons';
import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import * as actionCreators from './actionCreators';

import jsonApiReducer from './jsonApiReducer';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(combineReducers({
  apiStore: jsonApiReducer
}));

store.dispatch({
  type: 'DATA_LOAD',
  data: [{
    id: 'user-3903443433',
    type: 'user',
    attributes: {
      email: 'carlosrr@gmail.com'
    },
    relationships: {
      'favorite-movies': {
        self: '/users/user-3903443433/movies/favorites',
        related: '/users/user-3903443433/movies/favorites',
      },
      'people': {
        self: '/users/user-3903443433/people',
        related: '/users/user-3903443433/people',
      }
    }
  }]
});

function getAttribute(obj, attributeName, defaultValue) {
  return (obj || Immutable.fromJS({})).getIn(['attributes', attributeName], defaultValue);
}

const MovieComponent = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    const id = this.props.movie.get('id');
    const title = this.props.movie.getIn(['attributes', 'title']);
    return <li key={id}>{title} | last rendered {(new Date()).getTime()}</li>;
  }
});

const App = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  login(e) {
    e.preventDefault();
    this.props.login();
  },

  renderTop(store) {
    const currentUserId = store.getIn(['session', 'current-session', 'attributes', 'userId']);
    const currentUserEmail = store.getIn(['user', currentUserId, 'attributes', 'email']);

    return <div className="text-right">
      Last updated {(new Date()).getTime()} | {currentUserEmail ? currentUserEmail : <em>No session</em>} | <a className="btn btn-info" onClick={this.login}>Log in</a>
    </div>;
  },

  renderRelationship(relationshipName, modelName) {
    const {store} = this.props;
    const currentUserId = store.getIn(['session', 'current-session', 'attributes', 'userId']);
    const getProperties = (base, properties) => {
      return properties.reduce(function(obj, propName) {
        obj[propName] = store.getIn(base.concat([propName]));
        return obj;
      }, {});
    };

    const loadRelationship = (e) => {
      e.preventDefault();
      this.props.loadRelationship("user", currentUserId, relationshipName);
    };

    const r = ['relationships', 'user', currentUserId, relationshipName];
    const {isLoadingPage, nextPageHref, data} = getProperties(r, ['data', 'nextPageHref', 'isLoadingPage']);
    let loadMoreLink = 'Nothing to load';
    if (isLoadingPage) {
      loadMoreLink = 'loading...';
    }
    else if (nextPageHref) {
      loadMoreLink = <a href="#" onClick={loadRelationship}>load more...</a>;
    }

    return [
      <h2>/user/{relationshipName} {loadMoreLink}</h2>,
      <pre>{data &&  JSON.stringify(data.toJS(), null, ' ')}</pre>
    ];
  },

  render() {
    const {store} = this.props;

    const currentUserId = store.getIn(['session', 'current-session', 'attributes', 'userId']);
    const currentUserEmail = store.getIn(['user', currentUserId, 'attributes', 'email']);

    return <div>
      {this.renderTop(store)}
      <div className="row">
        <div className="col-sm-5 col-sm-offset-1">
          <h2>Store</h2>
          <pre>{JSON.stringify(store.toJS(), null, ' ')}</pre>
        </div>
        <div className="col-sm-3">
          {this.renderRelationship("favorite-movies", "movie")}
        </div>
        <div className="col-sm-3">
          {this.renderRelationship("people", "artist")}
        </div>
      </div>
    </div>;
  }
});

const SmartApp = connect(function(state) {
  return { store: state.apiStore };
}, function(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
})(App, {store: store});

window.onload = () => {
  React.render(  <Provider store={store}>
    {() => <SmartApp />}
  </Provider>, document.querySelector('#container'));
};
