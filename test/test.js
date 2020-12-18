const assert = require('assert');

const redrix = require('../redrix.js')

describe('Redrix', () => {
    describe('Query Parsing', () => {
        it('Remove instances of the words "a", "an", "is", and "the"', () => {
            assert.strictEqual(redrix.removeArticles('the brown fox'), 'brown fox');
            assert.strictEqual(redrix.removeArticles('an apple'), 'apple');
            assert.strictEqual(redrix.removeArticles('a black cat'), 'black cat');
        });
        it('Remove phrases like "can you please rip" and "do we have"', () => {
            assert.strictEqual(redrix.parseQuery('?_ rose').queryText, 'rose');
            assert.strictEqual(redrix.parseQuery('?_thorn').queryText, 'thorn');
            assert.strictEqual(redrix.parseQuery('do we have ash?').queryText, 'ash');
            assert.strictEqual(redrix.parseQuery('please rip the pelican').queryText, 'pelican');
            assert.strictEqual(redrix.parseQuery('can anyone tell me where the servitor is?').queryText, 'servitor')
        });
        it('Determine desired game from command prefix', () => {
            assert.strictEqual(redrix.parseQuery('?_ rose').game, undefined);
            assert.strictEqual(redrix.parseQuery('?D bite of the fox').game, 'destiny');
            assert.strictEqual(redrix.parseQuery('?H chief').game, 'halo');
            assert.strictEqual(redrix.parseQuery('?W excalibur').game, 'warframe');
        });
    });
});