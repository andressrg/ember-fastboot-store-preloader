import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('store-preloader-meta', 'Integration | Component | store preloader meta', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{store-preloader-meta}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  // this.render(hbs`
  //   {{#store-preloader-meta}}
  //     template block text
  //   {{/store-preloader-meta}}
  // `);

  // assert.equal(this.$().text().trim(), 'template block text');
});
