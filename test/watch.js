'use strict';

var gulp = require('../');
var fs = require('graceful-fs');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var path = require('path');

var should = require('should');
require('mocha');

var outpath = path.join(__dirname, './out-fixtures');

var tempFileContent = 'A test generated this file and it is safe to delete';

function createTempFile(path) {
  fs.writeFileSync(path, tempFileContent);
}

function updateTempFile(path) {
  var gazeTimeout = 125;
  setTimeout(function() {
    fs.appendFileSync(path, ' changed');
  }, gazeTimeout);
}

describe('gulp', function() {
  describe('watch()', function() {
    beforeEach(rimraf.bind(null, outpath));
    beforeEach(mkdirp.bind(null, outpath));
    afterEach(rimraf.bind(null, outpath));

    it('should call the function when file changes: no options', function(done) {
      var tempFile = path.join(outpath, 'watch-func.txt');

      createTempFile(tempFile);

      var watcher = gulp.watch(tempFile, function(cb) {
        watcher.close();
        cb();
        done();
      });

      updateTempFile(tempFile);
    });

    it('should execute the gulp.parallel tasks', function(done) {
      var tempFile = path.join(outpath, 'watch-func.txt');

      createTempFile(tempFile);

      gulp.task('test', function(cb) {
        watcher.close();
        cb();
        done();
      });

      var watcher = gulp.watch(tempFile, gulp.parallel('test'));

      updateTempFile(tempFile);
    });


    it('should not call the function when no file changes: no options', function(done) {
      var tempFile = path.join(outpath, 'watch-func.txt');

      createTempFile(tempFile);

      var watcher = gulp.watch(tempFile, function() {
        should.fail('Watcher erroneously called');
      });

      setTimeout(function() {
        watcher.close();
        done();
      }, 10);
    });

    it('should call the function when file changes: w/ options', function(done) {
      var tempFile = path.join(outpath, 'watch-func-options.txt');

      createTempFile(tempFile);

      var watcher = gulp.watch(tempFile, function(cb) {
        watcher.close();
        cb();
        done();
      });

      updateTempFile(tempFile);
    });

    it('should not drop options when no callback specified', function(done) {
      var tempFile = path.join(outpath, 'watch-func-nodrop-options.txt');
      // By passing a cwd option, ensure options are not lost to gaze
      var relFile = '../watch-func-nodrop-options.txt';
      var cwd = outpath + '/subdir';

      createTempFile(tempFile);

      var watcher = gulp.watch(relFile, {cwd: cwd})
        .on('change', function(filepath) {
          should.exist(filepath);
          path.resolve(cwd, filepath).should.equal(path.resolve(tempFile));
          watcher.close();
          done();
        });

      updateTempFile(tempFile);
    });

    it('should run many tasks: w/ options', function(done) {
      var tempFile = path.join(outpath, 'watch-task-options.txt');
      var a = 0;

      createTempFile(tempFile);

      gulp.task('task1', function(cb) {
        a++;
        cb();
      });
      gulp.task('task2', function(cb) {
        a += 10;
        a.should.equal(11);
        watcher.close();
        cb();
        done();
      });

      var watcher = gulp.watch(tempFile, gulp.series('task1', 'task2'));

      updateTempFile(tempFile);
    });

    it('should run many tasks: no options', function(done) {
      var tempFile = path.join(outpath, 'watch-many-tasks-no-options.txt');
      var a = 0;

      createTempFile(tempFile);

      gulp.task('task1', function(cb) {
        a++;
        cb();
      });
      gulp.task('task2', function(cb) {
        a += 10;
        a.should.equal(11);
        watcher.close();
        cb();
        done();
      });

      var watcher = gulp.watch(tempFile, gulp.series('task1', 'task2'));

      updateTempFile(tempFile);
    });

    it('should throw an error: passed parameter (string) is not a function', function(done) {
      var tempFile = path.join(outpath, 'empty.txt');

      createTempFile(tempFile);
      try {
        gulp.watch(tempFile, 'task1');
      } catch (err) {
        err.message.should.equal('watching ' + tempFile +  ': watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)');
        done();
      }
    });

    it('should throw an error: passed parameter (array) is not a function', function(done) {
      var tempFile = path.join(outpath, 'empty.txt');

      createTempFile(tempFile);
      try {
        gulp.watch(tempFile, ['task1']);
      } catch (err) {
        err.message.should.equal('watching ' + tempFile +  ': watch task has to be a function (optionally generated by using gulp.parallel or gulp.series)');
        done();
      }
    });

  });
});
