import DS from 'ember-data';


export default DS.Model.extend({
  title: DS.attr('string'),
  number: DS.attr('number'),

  book: DS.belongsTo('book'),
});
