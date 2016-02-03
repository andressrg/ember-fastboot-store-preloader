import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('serializes-snapshots');
  this.route('deserializes-snapshots');
});

export default Router;
