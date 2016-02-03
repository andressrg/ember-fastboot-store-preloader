import DS from 'ember-data';


export default DS.RESTAdapter.extend({
  generateIdForRecord() {
    return Math.floor(Math.random() * (10000 - 1)) + 1;
  },
});