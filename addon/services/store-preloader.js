import Ember from 'ember';


const { inject, get, set } = Ember;


function encodeForDOM(str='') {
  return encodeURI(str);
}


function decodeFromDOM(str) {
  return decodeURI(str);
}


function isFastboot() {
  return typeof FastBoot !== 'undefined';
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
});
