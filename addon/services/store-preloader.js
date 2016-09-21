import Ember from 'ember';


const { inject, get, set, RSVP } = Ember;


function encodeForDOM(str='') {
  return encodeURI(str);
}


function decodeFromDOM(str) {
  return decodeURI(str);
}


function isFastboot() {
  return typeof FastBoot !== 'undefined';
}


function forEachAsync(array, task) {
  return new RSVP.Promise((resolve, reject) => {
    let i = 0;

    function loop() {
      if (i < array.length) {
        const item = array[i];

        i++;

        RSVP.resolve()
          .then(() => task(item))
          .then(loop, reject);
      } else {
        resolve();
      }
    }

    loop();
  });
}

function chunk(arr, chunkSize) {
  return Array(Math.ceil(arr.length / chunkSize))
    .fill()
    .map((unused, i) => arr.slice(i * chunkSize, i * chunkSize + chunkSize));
}


function nextEmberLoopPromise() {
  return new RSVP.Promise(resolve => {
    Ember.run.next(null, resolve);
  });
}


function nextRAFPromise() {
  return new RSVP.Promise(resolve => {
    requestAnimationFrame(resolve);
  });
}


function runNextPromise() {
  if (window.requestAnimationFrame) {
    return nextRAFPromise();
  } else {
    return nextEmberLoopPromise();
  }
}


export default Ember.Service.extend({

  store: inject.service(),
  serializedData: null,

  keyValueCache: null,
  modelNamesList: null,
  deserializedKeyValueCache: null,


  init() {
    this._super(...arguments);
    this.keyValueCache = {};
    this.modelNamesList = [];
    this.deserializedKeyValueCache = {};
  },


  initializeStoreAsync() {
    if (!Ember.$) { return RSVP.resolve(); }

    const $metaElement = Ember.$('meta[data-id=store-preloader-meta-id]');
    if (!$metaElement || $metaElement.length === 0) { return RSVP.resolve(); }

    const storePreloader = get(this, 'storePreloader');

    return storePreloader.deserializeAsync($metaElement.attr('content'));
  },


  peekByKey(key) {
    return get(this, `deserializedKeyValueCache.${key}`);
  },


  serializeByKey(key, value, forceSerialization=false) {
    if (!isFastboot() && !forceSerialization) { return; }

    set(this, `keyValueCache.${key}`, value);
    this._serializeAll();
  },


  serializeModels(modelNamesList=[], forceSerialization=false) {
    if (!isFastboot() && !forceSerialization) { return; }

    set(this, 'modelNamesList',  modelNamesList);
    this._serializeAll();
  },


  _serializeAll() {
    const store = get(this, 'store');
    const keyValueCache = get(this, 'keyValueCache');
    const modelNamesList = get(this, 'modelNamesList');
    const records = modelNamesList
      .map(modelName => {
        const records = store.peekAll(modelName);

        return {
          type: modelName,
          records: records.map(record => record.serialize({ includeId: true })),
        };
      })
      .reduce((a, b) => b.records.length > 0 ? a.concat(b) : a, []);

    const serializedData = encodeForDOM(JSON.stringify({
      records,
      keyValueCache,
    }));
    set(this, 'serializedData', serializedData);
  },


  deserialize(encodedSerializedData, forceDeserialization=false) {
    if (isFastboot() && !forceDeserialization) { return; }

    const serializedData = decodeFromDOM(encodedSerializedData);
    const data = JSON.parse(serializedData);
    
    const store = get(this, 'store');
    data.records.forEach(typeHash => {
      typeHash.records.forEach(recordData => {
        const normalizedData = store.normalize(typeHash.type, recordData);
        store.push(normalizedData);
      });
    });

    set(this, 'deserializedKeyValueCache', data.keyValueCache);
  },


  deserializeAsync(encodedSerializedData, forceDeserialization=false, { chunkSize = 5 }={}) {
    if (isFastboot() && !forceDeserialization) { return; }

    const serializedData = decodeFromDOM(encodedSerializedData);
    const data = JSON.parse(serializedData);
    
    const store = get(this, 'store');

    return forEachAsync(data.records, typeHash => {
        return forEachAsync(chunk(typeHash.records, chunkSize), recordsChunk => {
          recordsChunk.forEach(recordData => {
            const normalizedData = store.normalize(typeHash.type, recordData);
            store.push(normalizedData);
          });

          return runNextPromise();
        });
      })
      .then(() => {
        set(this, 'deserializedKeyValueCache', data.keyValueCache);
      });
  },
});
