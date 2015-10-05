import axios from 'axios';

function runLoadRelationship(dispatch, href, type, id, name) {
  const relationship = { type, id, name, 'action': 'concat' };
  dispatch({
    type: 'RELATIONSHIP_LOAD_START',
    relationship
  });

  axios.get(`http://patient-tree-3875.getsandbox.com${href}`).then(({data}) => {
    dispatch(Object.assign({
      type: 'DATA_LOAD',
      relationship
    }, data));
  });
}

export function loadRandomUser() {
  return (dispatch) => {
    axios.get('https://randomuser.me/api/').then(response => {
      const data = response.data.results[0].user;
      dispatch({
        type: 'DATA_LOAD',
        data: {
          id: `random-${data.sha1}`,
          type: 'random-user',
          attributes: {
            email: data.email,
            username: data.username
          }
        }
      })
    });
  }
}

export function loadRelationship(model, id, relationshipName) {
  return (dispatch, getState) => {
    const state = getState();
    const href = state.api.getIn(['relationships', model, id, relationshipName, 'nextPageHref']);
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
