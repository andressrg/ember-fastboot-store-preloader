import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | serializes snapshots');

test('visiting /serializes-snapshots', function(assert) {
  visit('/serializes-snapshots');

  andThen(function() {
    assert.equal(currentURL(), '/serializes-snapshots');
    const metaElement = this.$('meta[data-id=store-preloader-meta-id]');
    assert.ok(metaElement.attr('content'));
  });
});
