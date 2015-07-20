// Generated by CoffeeScript 1.8.0
var File, Photo, async, download, fileByPage, fs, onThumbCreation, thumbHelpers;

File = require('../models/file');

Photo = require('../models/photo');

async = require('async');

fs = require('fs');

thumbHelpers = require('../helpers/thumb');

onThumbCreation = require('../helpers/initializer').onThumbCreation;

fileByPage = 5 * 12;

module.exports.fetch = function(req, res, next, id) {
  if (id.indexOf('.jpg') > 0) {
    id = id.substring(0, id.length - 4);
  }
  return File.find(id, (function(_this) {
    return function(err, file) {
      if (err) {
        return next(err);
      } else if (!file) {
        err = new Error("File " + id + " not found");
        err.status = 404;
        return next(err);
      } else {
        req.file = file;
        return next();
      }
    };
  })(this));
};

module.exports.list = function(req, res, next) {
  var dates, options, skip;
  if (req.params.page != null) {
    skip = parseInt(req.params.page) * fileByPage;
  } else {
    skip = 0;
  }
  dates = {};
  options = {
    limit: fileByPage + 1,
    skip: skip,
    descending: true
  };
  return File.imageByDate(options, (function(_this) {
    return function(err, photos) {
      var date, hasNext, mounth, photo, _i, _len;
      if (err) {
        return next(err);
      }
      if (photos.length === fileByPage + 1) {
        hasNext = true;
      } else {
        hasNext = false;
      }
      photos.splice(fileByPage, 1);
      for (_i = 0, _len = photos.length; _i < _len; _i++) {
        photo = photos[_i];
        date = new Date(photo.lastModification);
        mounth = date.getMonth() + 1;
        mounth = mounth > 9 ? "" + mounth : "0" + mounth;
        date = "" + (date.getFullYear()) + "-" + mounth;
        if (dates[date] != null) {
          dates[date].push(photo);
        } else {
          dates[date] = [photo];
        }
      }
      return res.send({
        files: dates,
        hasNext: hasNext
      });
    };
  })(this));
};

module.exports.thumb = function(req, res, next) {
  var stream, which;
  which = req.file.binary.thumb ? 'thumb' : 'file';
  stream = req.file.getBinary(which, function(err) {
    if (err) {
      return next(err);
    }
  });
  return stream.pipe(res);
};

download = function(res, file, rawFile, callback) {
  var stream;
  fs.openSync(rawFile, 'w');
  stream = file.getBinary('file', callback);
  stream.pipe(fs.createWriteStream(rawFile));
  return res.on('close', function() {
    return stream.abort();
  });
};

module.exports.createPhoto = function(req, res, next) {
  var file, photo;
  file = req.file;
  if (file.binary == null) {
    return next(new Error('no binary'));
  }
  photo = {
    date: file.lastModification,
    title: "",
    description: "",
    orientation: 1,
    albumid: "" + req.body.albumid,
    binary: file.binary
  };
  return Photo.create(photo, function(err, photo) {
    var rawFile, _ref;
    if (err) {
      return next(err);
    }
    if ((((_ref = photo.binary) != null ? _ref.thumb : void 0) != null) && (photo.binary.screen != null)) {
      return res.status(201).send(photo);
    } else {
      rawFile = "/tmp/" + photo.id;
      return download(res, file, rawFile, function(err) {
        if (err) {
          return next(err);
        }
        if (photo.binary.thumb == null) {
          return thumbHelpers.resize(rawFile, photo, 'thumb', function(err) {
            if (err) {
              return next(err);
            }
            return thumbHelpers.resize(rawFile, photo, 'screen', function(err) {
              return fs.unlink(rawFile, function() {
                return res.status(201).send(photo);
              });
            });
          });
        } else if (photo.binary.screen == null) {
          return thumbHelpers.resize(rawFile, photo, 'screen', function(err) {
            return fs.unlink(rawFile, function() {
              return res.status(201).send(photo);
            });
          });
        }
      });
    }
  });
};
