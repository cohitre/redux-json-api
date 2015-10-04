import {
  loadRelationship,
  loadData,
  extractData,
  extractRelationshipDefinitions,
  extractRelationshipUpdate,
  extractRelationshipData
} from '../src/json-api-reducer';
import Immutable from 'immutable';

describe('JsonApiReducer', function () {
  const SAMPLE_PAYLOAD = {
    id: 'user-1234567890',
    type: 'user',
    badAttribute: 'do not need this',
    something: 'ignore me',
    attributes: {
      name: 'Joe Salami',
    },
    relationships: {
      movies: {
        self: '/href/movies',
        related: '/href/movies'
      }
    }
  };

  describe('extractData', function () {
    it('extracts the correct properties', function() {
      const result = extractData(SAMPLE_PAYLOAD);
      expect(result).to.deep.equal({
        id: 'user-1234567890',
        type: 'user',
        attributes: {
          name: 'Joe Salami',
        },
        relationships: {
          movies: {
            self: '/href/movies',
            related: '/href/movies'
          }
        }
      });
    });
  });

  describe('extractRelationshipDefinitions', function() {
    it('ignores objects with no relationships', function() {
      const result = extractRelationshipDefinitions({});
      expect(result).to.be.null;
    });

    it('generates a relationship structure', function() {
      const result = extractRelationshipDefinitions({
        relationships: {
          movies: {
            self: '/href/movies',
            related: '/movies'
          },
          favorites: {
            self: '/href/movies',
            data: [{ type: 'movie', id: 'movie-123' }]
          }
        }
      });
      expect(result).to.deep.equal({
        movies: {
          nextPageHref: '/movies',
          data:[],
          size: null,
          isLoadingPage: false,
        },
        favorites: {
          nextPageHref: undefined,
          data: [{ type: 'movie', id: 'movie-123' }],
          size: null,
          isLoadingPage: false,
        }
      });
    });
  });

  describe('loadData', function() {
    it('merges the data into state', function() {
      const state = Immutable.fromJS({});
      const result = loadData(state, SAMPLE_PAYLOAD).toJS();
      expect(result).to.deep.equal({
        relationships: {
          user: {
            'user-1234567890': {
              movies: {
                nextPageHref: '/href/movies',
                data: [],
                size: null,
                isLoadingPage: false
              }
            }
          }
        },
        user: {
          'user-1234567890': {
            id: 'user-1234567890',
            type: 'user',
            attributes: {
              name: 'Joe Salami',
            },
            relationships: {
              movies: {
                self: '/href/movies',
                related: '/href/movies'
              }
            }
          }
        }
      });
    });

    it('does not nuke existing data', function() {
      const state = Immutable.fromJS({});
      const result = loadData(state, SAMPLE_PAYLOAD);
      expect(loadData(result, SAMPLE_PAYLOAD)).to.equal(result);
    });
  });

  describe('extractRelationshipData', function() {
    it('can take the data as an object', function() {
      const result = extractRelationshipData({
        data: SAMPLE_PAYLOAD
      });
      expect(result).to.deep.equal([{
        type: 'user',
        id: 'user-1234567890'
      }]);
    });

    it('can take the data as an array', function() {
      const result = extractRelationshipData({
        data: [SAMPLE_PAYLOAD]
      });
      expect(result).to.deep.equal([{
        type: 'user',
        id: 'user-1234567890'
      }]);
    });
  });

  describe('extractRelationshipUpdate', function() {
    it('uses the meta and link to create a relationship definition', function() {
      const result = extractRelationshipUpdate({
        links: {
          next: '/href'
        },
        meta: {
          size: 10,
        },
      });

      expect(result).to.deep.equal({
        nextPageHref: '/href',
        size: 10,
        isLoadingPage: false,
      });
    });
  });

  describe('loadRelationship', function() {
    const rel = {
      name: 'movies',
      id: 'user-1234567890',
      type: 'user'
    };

    it('stores the data in the state', function() {
      const state = Immutable.fromJS({});
      const result = loadRelationship(state, rel, {
        data: [SAMPLE_PAYLOAD],
        meta: {
          size: 10
        },
        links: {
          next: '/href/'
        }
      });
      expect(result.toJS()).to.deep.equal({
        relationships: {
          user: {
            'user-1234567890': {
              movies: {
                nextPageHref: '/href/',
                size: 10,
                isLoadingPage: false,
                data: [{ type: 'user', id: 'user-1234567890' }]
              }
            }
          }
        }
      });
    });

    it('concats the data to the state', function() {
      const state = Immutable.fromJS({
        relationships: {
          user: {
            'user-1234567890': {
              movies: {
                nextPageHref: '/href/',
                size: 10,
                isLoadingPage: false,
                data: [{ type: 'user', id: 'user-1234567890' }]
              }
            }
          }
        }
      });
      const result = loadRelationship(state, rel, {
        data: [SAMPLE_PAYLOAD],
        meta: {
          size: 10
        },
        links: {
          next: '/href/1'
        }
      });
      expect(result.toJS()).to.deep.equal({
        relationships: {
          user: {
            'user-1234567890': {
              movies: {
                nextPageHref: '/href/1',
                size: 10,
                isLoadingPage: false,
                data: [{ type: 'user', id: 'user-1234567890' }, { type: 'user', id: 'user-1234567890'}]
              }
            }
          }
        }
      });
      expect(result).to.not.equal(state);
    });

    it('does not updated the state if not needed', function() {
      const state = Immutable.fromJS({
        relationships: {
          user: {
            'user-1234567890': {
              movies: {
                nextPageHref: '/href/',
                size: 10,
                isLoadingPage: false,
                data: [{ type: 'user', id: 'user-1234567890' }]
              }
            }
          }
        }
      });
      const result = loadRelationship(state, rel, {
        data: [],
        meta: {
          size: 10
        },
        links: {
          next: '/href/'
        }
      });
      expect(result).to.equal(state);
    });
  });
});
