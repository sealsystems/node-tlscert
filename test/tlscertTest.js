'use strict';

const path = require('path');
const tls = require('tls');

const assert = require('assertthat');
const { nodeenv } = require('nodeenv');

const tlscert = require('../lib/tlscert');

suite('tlscert', () => {
  test('is an object.', (done) => {
    assert.that(tlscert).is.ofType('object');
    done();
  });

  suite('get', () => {
    test('is a function.', (done) => {
      assert.that(tlscert.get).is.ofType('function');
      done();
    });

    suite('keystore', () => {
      test('is an object.', async () => {
        const keystore = await tlscert.get();

        assert.that(keystore).is.ofType('object');
      });

      suite('using environment variable TLS_DIR', () => {
        suite('that is not set', () => {
          let restoreEnvironment;

          suiteSetup((done) => {
            const restore = nodeenv('TLS_DIR', undefined);

            restoreEnvironment = restore;
            done();
          });

          suiteTeardown((done) => {
            restoreEnvironment();
            done();
          });

          test('contains a default key.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.key).is.startingWith('-----BEGIN RSA PRIVATE KEY-----');
          });

          test('contains a default certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.cert).is.startingWith('-----BEGIN CERTIFICATE-----');
          });

          test('does not contain a default ca certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.ca).is.undefined();
          });

          test('sets isFallback to true.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.isFallback).is.equalTo(true);
          });
        });

        suite('that is set to a directory', () => {
          let restoreEnvironment;

          suiteSetup((done) => {
            const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCertCa'));

            restoreEnvironment = restore;
            done();
          });

          suiteTeardown((done) => {
            restoreEnvironment();
            done();
          });

          test('throws an error if the configured directory does not exist.', async () => {
            const restore = nodeenv('TLS_DIR', path.join(__dirname, 'does-not-exist'));

            await assert
              .that(async () => {
                await tlscert.get();
              })
              .is.throwingAsync();
            restore();
          });

          test('contains a key.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.key).is.startingWith('key');
          });

          test('contains a certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.cert).is.startingWith('cert');
          });

          test('contains a ca certificate.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.ca).is.startingWith('ca');
          });

          test('sets isFallback to false.', async () => {
            const keystore = await tlscert.get();

            assert.that(keystore.isFallback).is.equalTo(false);
          });

          suite('handles optional types', () => {
            test('ignores a missing ca certificate.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCert'));

              await assert
                .that(async () => {
                  await tlscert.get();
                })
                .is.not.throwingAsync();
              restore();
            });

            test('throws an error if the key is missing.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'certCa'));

              await assert
                .that(async () => {
                  await tlscert.get();
                })
                .is.throwingAsync();
              restore();
            });

            test('throws an error if the certificate is missing.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCa'));

              await assert
                .that(async () => {
                  await tlscert.get();
                })
                .is.throwingAsync();
              restore();
            });
          });
        });
      });

      suite('using another environment variable', () => {
        test('contains a default certificate if not set.', async () => {
          const restore = nodeenv('TLS_FOO', undefined);
          const keystore = await tlscert.get('TLS_FOO');

          assert.that(keystore.cert).is.startingWith('-----BEGIN CERTIFICATE-----');
          restore();
        });

        test('contains a certificate if set.', async () => {
          const restore = nodeenv('TLS_FOO', path.join(__dirname, 'keyCertCa'));
          const keystore = await tlscert.get('TLS_FOO');

          assert.that(keystore.cert).is.startingWith('cert');
          restore();
        });
      });
    });
  });

  suite('getExternal', () => {
    test('is a function.', async () => {
      assert.that(tlscert.getExternal).is.ofType('function');
    });

    suite('keystore', () => {
      test('is an object.', async () => {
        const keystore = await tlscert.getExternal();

        assert.that(keystore).is.ofType('object');
      });

      suite('using environment variable TLS_DIR', () => {
        suite('that is not set', () => {
          let restoreEnvironment;

          suiteSetup((done) => {
            const restore = nodeenv('TLS_DIR', undefined);

            restoreEnvironment = restore;
            done();
          });

          suiteTeardown((done) => {
            restoreEnvironment();
            done();
          });

          test('contains a default key.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.key).is.startingWith('-----BEGIN RSA PRIVATE KEY-----');
          });

          test('contains a default certificate.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.cert).is.startingWith('-----BEGIN CERTIFICATE-----');
          });

          test('does not contain a default ca certificate.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.ca).is.undefined();
          });

          test('sets isFallback to true.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.isFallback).is.equalTo(true);
          });
        });

        suite('that is set to a directory', () => {
          let restoreEnvironment;

          suiteSetup((done) => {
            const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCertCa'));

            restoreEnvironment = restore;
            done();
          });

          suiteTeardown((done) => {
            restoreEnvironment();
            done();
          });

          test('throws an error if the configured directory does not exist.', async () => {
            const restore = nodeenv('TLS_DIR', path.join(__dirname, 'does-not-exist'));

            await assert
              .that(async () => {
                await tlscert.getExternal();
              })
              .is.throwingAsync();
            restore();
          });

          test('contains a key.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.key).is.startingWith('key');
          });

          test('contains a certificate.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.cert).is.startingWith('cert');
          });

          test('contains a ca certificate.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.ca).is.startingWith('ca');
          });

          test('sets isFallback to false.', async () => {
            const keystore = await tlscert.getExternal();

            assert.that(keystore.isFallback).is.equalTo(false);
          });

          suite('handles optional types', () => {
            test('ignores a missing ca certificate.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCert'));

              await assert
                .that(async () => {
                  await tlscert.getExternal();
                })
                .is.not.throwingAsync();
              restore();
            });

            test('throws an error if the key is missing.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'certCa'));

              await assert
                .that(async () => {
                  await tlscert.getExternal();
                })
                .is.throwingAsync();
              restore();
            });

            test('throws an error if the certificate is missing.', async () => {
              const restore = nodeenv('TLS_DIR', path.join(__dirname, 'keyCa'));

              await assert
                .that(async () => {
                  await tlscert.getExternal();
                })
                .is.throwingAsync();
              restore();
            });
          });
        });
      });

      suite('using environment variable TLS_EXTERNAL_DIR', () => {
        let restoreEnvironment;

        suiteSetup((done) => {
          const restore = nodeenv('TLS_EXTERNAL_DIR', path.join(__dirname, 'keyCertCaExt'));

          restoreEnvironment = restore;
          done();
        });

        suiteTeardown((done) => {
          restoreEnvironment();
          done();
        });

        test('throws an error if the configured directory does not exist.', async () => {
          const restore = nodeenv('TLS_EXTERNAL_DIR', path.join(__dirname, 'does-not-exist'));

          await assert
            .that(async () => {
              await tlscert.getExternal();
            })
            .is.throwingAsync();
          restore();
        });

        test('contains a key.', async () => {
          const keystore = await tlscert.getExternal();

          assert.that(keystore.key).is.startingWith('external key');
        });

        test('contains a certificate.', async () => {
          const keystore = await tlscert.getExternal();

          assert.that(keystore.cert).is.startingWith('external cert');
        });

        test('contains a ca certificate.', async () => {
          const keystore = await tlscert.getExternal();

          assert.that(keystore.ca).is.startingWith('external ca');
        });

        test('sets isFallback to false.', async () => {
          const keystore = await tlscert.getExternal();

          assert.that(keystore.isFallback).is.equalTo(false);
        });
      });
    });
  });

  suite('getTlsMinVersion', () => {
    test('is a function.', async () => {
      assert.that(tlscert.getTlsMinVersion).is.ofType('function');
    });

    suite('version', () => {
      test('is a string and equal to tls.DEFAULT_MIN_VERSION.', async () => {
        const version = await tlscert.getTlsMinVersion();
        console.log('version: ', version);
        assert.that(version).is.ofType('string');
        assert.that(version).is.equalTo(tls.DEFAULT_MIN_VERSION);
      });

      suite('using environment variable TLS_PROTOCOL', () => {
        suite('that is not set', () => {
          let restoreEnvironment;

          suiteSetup((done) => {
            const restore = nodeenv('TLS_PROTOCOL', undefined);
            restoreEnvironment = restore;
            done();
          });

          suiteTeardown((done) => {
            restoreEnvironment();
            done();
          });

          test('contains a default value.', async () => {
            const version = await tlscert.getTlsMinVersion();
            assert.that(version).is.equalTo(tls.DEFAULT_MIN_VERSION);
          });
        });
      });

      suite('that is set to v1', () => {
        let restoreEnvironment;

        suiteSetup((done) => {
          const restore = nodeenv('TLS_PROTOCOL', 'TLSv1_method');

          restoreEnvironment = restore;
          done();
        });

        suiteTeardown((done) => {
          restoreEnvironment();
          done();
        });

        test('set version to v1.', async () => {
          const value = await tlscert.getTlsMinVersion();
          assert.that(value).is.equalTo('TLSv1');
        });
      });

      suite('that is set to v1.1', () => {
        let restoreEnvironment;

        suiteSetup((done) => {
          const restore = nodeenv('TLS_PROTOCOL', 'TLSv1_1_method');

          restoreEnvironment = restore;
          done();
        });

        suiteTeardown((done) => {
          restoreEnvironment();
          done();
        });

        test('set version to v1.1', async () => {
          const value = await tlscert.getTlsMinVersion();
          assert.that(value).is.equalTo('TLSv1.1');
        });
      });

      suite('that is set to v1.2', () => {
        let restoreEnvironment;

        suiteSetup((done) => {
          const restore = nodeenv('TLS_PROTOCOL', 'TLSv1_2_method');

          restoreEnvironment = restore;
          done();
        });

        suiteTeardown((done) => {
          restoreEnvironment();
          done();
        });

        test('set version to v1.2', async () => {
          const value = await tlscert.getTlsMinVersion();
          assert.that(value).is.equalTo('TLSv1.2');
        });
      });

      suite('that is set to v1.3', () => {
        let restoreEnvironment;

        suiteSetup((done) => {
          const restore = nodeenv('TLS_PROTOCOL', 'TLSv1_3_method');

          restoreEnvironment = restore;
          done();
        });

        suiteTeardown((done) => {
          restoreEnvironment();
          done();
        });

        test('set version to v1.3', async () => {
          const value = await tlscert.getTlsMinVersion();
          assert.that(value).is.equalTo('TLSv1.3');
        });
      });
    });
  });
});
