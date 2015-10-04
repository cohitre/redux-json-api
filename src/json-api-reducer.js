import Immutable from 'immutable';

function getData(data) {
  if (data === null) {
    return data;
  }
  return Array.isArray(data) ? data : [data];
}

function pick(object, keys) {
  return keys.reduce((result, keyName) => {
    result[keyName] = object[keyName];
    return result;
  }, {});
}

export function extractData(object) {
  return pick(object, ['id', 'type', 'attributes', 'relationships']);
}

export function extractRelationshipDefinitions(object) {
  if (object.relationships) {
    return Object.keys(object.relationships).reduce((rel, relationshipName) => {
      rel[relationshipName] = {
        nextPageHref: object.relationships[relationshipName].related,
        data: object.relationships[relationshipName].data || [],
        size: null,
        isLoadingPage: false
      };
      return rel;
    }, {});
  }
  return null;
}

export function extractRelationshipUpdate(object) {
  return {
    nextPageHref: object.links.next,
    size: object.meta.size,
    isLoadingPage: false,
  };
}

export function extractRelationshipData(object) {
  return getData(object.data).map(obj => pick(obj, ['id', 'type']));
}

export function loadData(state, object) {
  const {type, id} = object;
  const objectData = extractData(object);
  const relationshipsData = extractRelationshipDefinitions(object);
  return state
    .mergeDeepIn([type, id], objectData)
    .mergeDeepIn(['relationships', type, id], relationshipsData);
}

export function loadRelationship(state, relationship, object) {
  const {type, id, name} = relationship;
  const existingData = state.getIn(['relationships', type, id, name, 'data'], Immutable.List());
  return state
    .mergeDeepIn(['relationships', type, id, name], extractRelationshipUpdate(object))
    .setIn(['relationships', type, id, name, 'data'], existingData.concat(extractRelationshipData(object)));
}

export default function(state = Immutable.fromJS({}), action) {
  switch (action.type) {
    case 'RELATIONSHIP_LOAD_START':
      return state.setIn(['relationships', action.relationship.type, action.relationship.id, action.relationship.name, 'isLoadingPage'], true);
    case 'RELATIONSHIP_LOAD':
      return loadRelationship(getData(action.data).reduce(loadData, state), action.relationship, pick(action, ['meta', 'links', 'data']));
    case 'DATA_LOAD':
      return getData(action.data).reduce(loadData, state);
    default:
      return state;
  }
}
