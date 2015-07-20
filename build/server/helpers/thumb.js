// Generated by CoffeeScript 1.8.0
var fs, gm, log, mime, thumb, whiteList;

fs = require('fs');

gm = require('gm');

mime = require('mime');

log = require('printit')({
  prefix: 'thumbnails'
});

whiteList = ['image/jpeg', 'image/png'];

module.exports = thumb = {
  readMetadata: function(filePath, callback) {
    return gm(filePath).options({
      imageMagick: true
    }).identify(function(err, data) {
      var metadata, orientation;
      if (err) {
        return callback(err);
      } else {
        orientation = data.Orientation;
        if (!(orientation != null) || data.Orientation === 'Undefined') {
          orientation = 1;
        }
        metadata = {
          exif: {
            orientation: orientation,
            date: data.Properties['date:create']
          }
        };
        return callback(null, metadata);
      }
    });
  },
  attachFile: function(file, dstPath, name, callback) {
    return file.attachBinary(dstPath, {
      name: name
    }, function(err) {
      return fs.unlink(dstPath, function(unlinkErr) {
        if (err) {
          console.log(unlinkErr);
        }
        return callback(err);
      });
    });
  },
  resize: function(srcPath, file, name, callback) {
    var attachFile, buildThumb, dstPath, err, gmRunner;
    dstPath = "/tmp/2-" + file.id;
    try {
      attachFile = (function(_this) {
        return function(err) {
          if (err) {
            return callback(err);
          } else {

          }
        };
      })(this);
      gmRunner = gm(srcPath).options({
        imageMagick: true
      });
      if (name === 'thumb') {
        buildThumb = function(width, height) {
          return gmRunner.resize(width, height).crop(300, 300, 0, 0).write(dstPath, function(err) {
            if (err) {
              return callback(err);
            } else {
              return thumb.attachFile(file, dstPath, name, callback);
            }
          });
        };
        return gmRunner.size(function(err, data) {
          if (err) {
            return callback(err);
          } else {
            if (data.width > data.height) {
              return buildThumb(null, 300);
            } else {
              return buildThumb(300, null);
            }
          }
        });
      } else if (name === 'screen') {
        return gmRunner.resize(1200, 800).write(dstPath, function(err) {
          if (err) {
            return callback(err);
          } else {
            return thumb.attachFile(file, dstPath, name, callback);
          }
        });
      }
    } catch (_error) {
      err = _error;
      console.log(err);
      return callback(err);
    }
  }
};
