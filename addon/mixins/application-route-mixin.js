import Ember from 'ember';


const { inject, get, RSVP } = Ember;


export default Ember.Mixin.create({
  storePreloader: inject.service(),


  beforeModel() {
    return RSVP.resolve(this._super(...arguments))
      .then(() => {
        if (!Ember.$) { return; }

        const $metaElement = Ember.$('meta[data-id=store-preloader-meta-id]');
        if (!$metaElement || $metaElement.length === 0) { return; }

        const storePreloader = get(this, 'storePreloader');
        
        return storePreloader.deserializeAsync($metaElement.attr('content'));
      });
  }
});
