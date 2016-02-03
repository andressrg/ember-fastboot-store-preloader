import Ember from 'ember';


const { inject, get, set } = Ember;


function toBase64(str='') {
  if (typeof Buffer !== 'undefined') {
    /* globals Buffer */
    return (new Buffer(str)).toString('base64');
  } else {
    return btoa(str);
  }
}


function fromBase64(str) {
  if (typeof Buffer !== 'undefined') {
    /* globals Buffer */
    return new Buffer(str, 'base64').toString('binary');
  } else {
    return atob(str);
  }
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
          records: records.map(record => record.toJSON({ includeId: true })),
        };
      })
      .reduce((a, b) => b.records.length > 0 ? a.concat(b) : a, []);

    const serializedData = toBase64(JSON.stringify(records));
    set(this, 'serializedData', serializedData);
  },


  deserialize(encodedSerializedData) {
    if (isFastboot()) { return; }

    const serializedData = fromBase64(encodedSerializedData);
    const data = JSON.parse(serializedData);
    
    const store = get(this, 'store');
    data.forEach(typeHash => {
      typeHash.records.forEach(recordData => {
        store.push(store.normalize(typeHash.type, recordData));
      });
    });
  },

});
