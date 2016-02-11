import Ember from 'ember';


const { inject, get } = Ember;


export default Ember.Route.extend({
  storePreloader: inject.service(),
  store: inject.service(),

  model() {
    const store = get(this, 'store');

    const book = store.createRecord('book', {
      title: 'My book',
      description: 'A great book!',
    });

    const chaptersData = [
      {
        number: 1,
        title: 'The first chapter',
      },
      {
        number: 1,
        title: 'Another chapter',
      },
    ];

    chaptersData.forEach(c => {
      c.book = book;
      store.createRecord('chapter', c);
    });
  },

  afterModel() {
    const storePreloader = get(this, 'storePreloader');

    return storePreloader.serializeModels(['book', 'chapter'], true);
  }
});
