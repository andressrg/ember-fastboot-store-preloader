import Ember from 'ember';
import layout from '../templates/components/store-preloader-meta';


const { inject, computed } = Ember;


export default Ember.Component.extend({
  layout,

  storePreloader: inject.service(),
  serializedData: computed.alias('storePreloader.serializedData'),
  metaId: 'store-preloader-meta-id',
});
