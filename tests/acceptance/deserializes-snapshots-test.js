import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | deserializes snapshots');

test('visiting /deserializes-snapshots', function(assert) {
  visit('/');

  visit('/deserializes-snapshots');

  andThen(function() {
    assert.equal(currentURL(), '/deserializes-snapshots');
  });
});
