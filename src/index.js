import React from 'react/addons';
import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import * as actionCreators from './actionCreators';

import jsonApiReducer from './json-api-reducer';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reduxStore = createStoreWithMiddleware(combineReducers({
  api: jsonApiReducer
}));

reduxStore.dispatch({
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

  renderRelationship(relationshipName) {
    const {store} = this.props;
    const currentUserId = store.getIn(['session', 'current-session', 'attributes', 'userId']);
    const getProperties = (base, properties) => {
      return properties.reduce((obj, propName) => {
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
    } else if (nextPageHref) {
      loadMoreLink = <a href="#" onClick={loadRelationship}>load more...</a>;
    }

    return [
      <h2>/user/{relationshipName} {loadMoreLink}</h2>,
      <pre>{data &&  JSON.stringify(data.toJS(), null, ' ')}</pre>
    ];
  },

  render() {
    const {store} = this.props;
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

const SmartApp = connect((state) => {
  return { store: state.api };
}, (dispatch) => bindActionCreators(actionCreators, dispatch)
)(App, { store: reduxStore });

window.onload = () => {
  React.render(<Provider store={reduxStore}>
    {() => <SmartApp />}
  </Provider>, document.querySelector('#container'));
};
