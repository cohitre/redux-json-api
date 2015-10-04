import Immutable from 'immutable';

function loadData(state, object) {
  const {type, id} = object
  state = state
    .setIn([type, id, 'id'], id)
    .setIn([type, id, 'type'], type)
    .mergeDeepIn([type, id, 'attributes'], object.attributes)
    .mergeDeepIn([type, id, 'relationships'], object.relationships);

  return Object.keys(object.relationships || {}).reduce(function(state, relationshipName) {
    return state.mergeIn(["relationships", type, id, relationshipName], {
        nextPageHref: object.relationships[relationshipName].related,
        size: null,
        data: [],
        isLoadingPage: false,
      });
  }, state);
}

function loadHasMany(state, type, id, relationshipName, action) {
  const relationshipList = state.getIn([type, id, 'relationships', relationshipName, 'data'], Immutable.List());
  return getData(action.data).reduce(loadData, state)
    .mergeIn(['relationships', type, id, relationshipName], {
      nextPageHref: action.links.next,
      size: action.meta.size,
      data: relationshipList.concat(action.data.map(function({id, type}) {
        return {id, type};
      })),
      isLoadingPage: false,
    });
}

function getData(data) {
  if (data === null) {
    return data;
  }
  else {
    return Array.isArray(data) ? data : [data];
  }
}

export default function(state=Immutable.fromJS({}), action) {
  switch (action.type) {
    case 'RELATIONSHIP_LOAD_START':
      return state.setIn(['relationships', action.relationship.type, action.relationship.id, action.relationship.name, 'isLoadingPage'], true);
    case 'RELATIONSHIP_LOAD':
      return loadHasMany(state, action.relationship.type, action.relationship.id, action.relationship.name, {
        meta: action.meta,
        links: action.links,
        data: getData(action.data)
      });
    case 'DATA_LOAD':
      return getData(action.data).reduce(loadData, state);
    default:
      return state;
  }
}
