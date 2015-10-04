import axios from 'axios';

function runLoadRelationship(dispatch, href, type, id, name) {
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

export function loadRelationship(model, id, relationshipName) {
  return function(dispatch, getState) {
    const state = getState();
    const href = state.apiStore.getIn(['relationships', model, id, relationshipName, 'nextPageHref']);
    runLoadRelationship(dispatch, href, model, id, relationshipName);
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
