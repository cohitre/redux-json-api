import axios from 'axios';

function loadRelationship(dispatch, href, type, id, name) {
  const relationship = { type, id, name };
  dispatch({
    type: 'RELATIONSHIP_LOAD_START',
    relationship
  });

  axios.get(`http://patient-tree-3875.getsandbox.com${href}`)
    .then(function (response) {
      return dispatch(Object.assign({
        type: 'RELATIONSHIP_LOAD',
        relationship
      }, response.data));
    });
}

export function loadFavoriteMovies() {
  return function(dispatch, getState) {
    const state = getState();
    const userId = state.apiStore.getIn(['session', 'current-session', 'attributes', 'userId']);
    const href = state.apiStore.getIn(['user', userId, 'relationships', 'favorite-movies', 'nextPageHref']);

    loadRelationship(dispatch, href, 'user', userId, 'favorite-movies');
  };
}

export function login() {
  return {
    type: 'DATA_LOAD',
    data: {
      id: 'current-session',
      type: 'session',
      attributes: {
        'userId': 'user-3903443433'
      }
    }
  };
}
