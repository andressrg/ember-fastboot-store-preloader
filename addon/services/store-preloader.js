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


  serialize(modelNamesList=[], forceSerialization=false) {
    if (!isFastboot() && !forceSerialization) { return; }

    const store = get(this, 'store');
    const records = modelNamesList
      .map(modelName => {
        const records = store.peekAll(modelName);

        return {
          type: modelName,
          records: records.map(record => record.serialize({ includeId: true })),
        };
      })
      .reduce((a, b) => b.records.length > 0 ? a.concat(b) : a, []);

    const serializedData = encodeForDOM(JSON.stringify(records));
    set(this, 'serializedData', serializedData);
  },


  deserialize(encodedSerializedData) {
    if (isFastboot()) { return; }

    const serializedData = decodeFromDOM(encodedSerializedData);
    const data = JSON.parse(serializedData);
    
    const store = get(this, 'store');
    data.forEach(typeHash => {
      typeHash.records.forEach(recordData => {
        const normalizedData = store.normalize(typeHash.type, recordData);
        store.push(normalizedData);
      });
    });
  },

});
