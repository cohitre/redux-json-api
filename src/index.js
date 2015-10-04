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
        related: '/users/user-3903443433/movies/favorites',
      }
    }
  }]
});

function getAttribute(obj, attributeName, defaultValue) {
  return (obj || Immutable.fromJS({})).getIn(['attributes', attributeName], defaultValue);
}

const App = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  login(e) {
    e.preventDefault();
    this.props.login();
  },

  addMovie(e) {
    e.preventDefault();
    this.props.addMovie();
  },

  loadFavoriteMovies(e) {
    e.preventDefault();
    this.props.loadFavoriteMovies();
  },

  render() {
    const store = this.props.applicationState;

    const currentUserId = store.getIn(['session', 'current-session', 'attributes', 'userId']);
    const currentUserEmail = store.getIn(['user', currentUserId, 'attributes', 'email']);
    const movieComponents = store.get('movie', Immutable.Map()).reduce(function(movieComponents, value, id) {
      const fav = (e) => {
        e.preventDefault();
        this.props.favoriteMovie(id);
      };
      movieComponents.push(<li key={id}>{value.getIn(['attributes', 'title'])}</li>);
      return movieComponents;
    }, []);

    const isLoadingPage = store.getIn(['user', currentUserId, 'relationships', 'favorite-movies', 'isLoadingPage']);
    const nextPageHref =  store.getIn(['user', currentUserId, 'relationships', 'favorite-movies', 'nextPageHref']);
    let loadMoreLink = 'Nothing to load';
    if (isLoadingPage) {
      loadMoreLink = 'loading...';
    }
    else if (nextPageHref) {
      loadMoreLink = <a href="#" onClick={this.loadFavoriteMovies}>Load favorites</a>;
    }

    return <div>
      <a href="#" onClick={this.login}>Log-in</a> - <a href="#" onClick={this.addMovie}>Add movie</a>
      <h1>{currentUserEmail} - {currentUserId}</h1>
      <p>Last rendered: {(new Date()).getTime()}</p>
      <h2>Favorite movies {loadMoreLink}</h2>
      <ul style={{float: 'left', width: '300px'}}>{movieComponents}</ul>
      <pre style={{float: 'left'}}>{JSON.stringify(store.toJS(), null, ' ')}</pre>
    </div>;
  }
});

const SmartApp = connect(function(state) {
  return { applicationState: state.apiStore };
}, function(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
})(App, {store: store});

window.onload = () => {
  React.render(  <Provider store={store}>
    {() => <SmartApp />}
  </Provider>, document.querySelector('#container'));
};
