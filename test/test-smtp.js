var
  util = require('util'),
  fs = require('fs'),
  vows = require('vows'),
  assert = require('assert'),
  Horseshoe = require(__dirname + '/../lib/horseshoe').Horseshoe,
  suite = vows.describe('Horseshoe SMTP'),
  // This assumes you have a file with horseshoe options in json format called
  // config.json in the directory above this script. This config file IS NOT
  // included in the repo so you should create your own.
  config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8')),
  horseshoe = new Horseshoe(config);

horseshoe.setTemplatesPath(__dirname + '/mail_templates/');

suite.addBatch({

  'send smtp error no sender': {
    topic: function () {
      var
        horseshoe = new Horseshoe({ transport: 'smtp' }),
        msg = {
          to: 'lupo@e-noise.com',
          template: 'users-signup',
          data: { user: { firstname: 'Lupo' } }
        };

      horseshoe.send(msg, this.callback);
    },
    'get sender address error': function (errors, success) {
      assert.ok(!success);
      assert.ok(util.isArray(errors));
      errors.forEach(function (er) {
        assert.ok(er instanceof Error);
        assert.ok(typeof er.message === 'string');
        assert.ok(er.name === 'HorseshoeError');
        assert.ok(er.email && er.email.to === 'lupo@e-noise.com');
      });
    }
  },

  'send smtp error connection refused': {
    topic: function () {
      var
        horseshoe = new Horseshoe({ transport: 'smtp', sender: 'lupo@e-noise.com' }),
        msg = {
          to: 'lupo@e-noise.com',
          template: 'users-signup',
          data: { user: { firstname: 'Lupo' } }
        };

      horseshoe.send(msg, this.callback);
    },
    'get connection refused error': function (errors, success) {
      assert.ok(!success);
      assert.ok(util.isArray(errors));
      errors.forEach(function (er) {
        assert.ok(er instanceof Error);
        assert.ok(typeof er.message === 'string');
        assert.ok(/ECONNREFUSED/.test(er.message));
        assert.ok(er.name === 'HorseshoeError');
        assert.ok(er.email && er.email.to === 'lupo@e-noise.com');
      });
    }
  },

  'send smtp': {
    topic: function () {
      var msg = {
        to: 'lupo@e-noise.com',
        template: 'users-signup',
        data: { user: { firstname: 'Lupo' } }
      };

      horseshoe.send(msg, this.callback);
    },
    'get success (this has sent real email, check mailbox)': function (errors, success) {
      assert.ok(success);
      assert.ok(!errors);
    }
  }

});

suite.export(module);