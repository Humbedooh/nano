var specify  = require('specify')
  , async    = require('async')
  , helpers  = require('../helpers')
  , timeout  = helpers.timeout
  , nano     = helpers.nano
  , nock     = helpers.nock
  ;

var mock = nock(helpers.couch, "show/query")
  , db   = nano.use("show_query")
  ;

specify("show_query:setup", timeout, function (assert) {
  nano.db.create("show_query", function (err) {
    assert.equal(err, undefined, "Failed to create database");
    db.insert(
    { "shows": {
      "singleDoc": function(doc, req) { return { body: { name: doc.name, city: doc.city, format: 'json' }, headers: { 'Content-Type': 'application/json' } }; }
    }
    }, '_design/people', function (error, response) {
      assert.equal(error, undefined, "Failed to create show function");
      assert.equal(response.ok, true, "Response should be ok");
      async.parallel(
        [ function(cb) { db.insert(
            { name: "Clemens", city: "Dresden" }, "p_clemens", cb); }
        , function(cb) { db.insert(
            { name: "Randall", city: "San Francisco" }, "p_randall", cb); }
        , function(cb) { db.insert(
            { name: "Nuno", city: "New York" }, "p_nuno", cb); }
        ]
      , function(error, results) {
        assert.equal(error, undefined, "Should have stored docs");
      });
    });
  });
});

specify("show_query:test", timeout, function (assert) {
  db.show('people','singleDoc', 'p_clemens', function (error, doc) {
    assert.equal(error, undefined, "Show function didn't respond");
    assert.equal(doc.name,'Clemens');
    assert.equal(doc.city,'Dresden');
    assert.equal(doc.format,'json');
  });
});

specify("show_query:teardown", timeout, function (assert) {
  nano.db.destroy("show_query", function (err) {
    assert.equal(err, undefined, "Failed to destroy database");
    assert.ok(mock.isDone(), "Some mocks didn't run");
  });
});

specify.run(process.argv.slice(2));