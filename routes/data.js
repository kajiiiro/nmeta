var express = require('express');
var router = express.Router();

var _logger = null;
var _config = null;
var _pg = null;
router.init = function(logger, config, pg) {
  _logger = logger;
  _config = config;
  _pg = pg;
};

var errorToNext = function(err, next, statusCode, done) {
  err.status = statusCode;
  next(err);
  if (done) done();
};

var createSql = function(body, sqlPrefix) {
  var sqls = [],
    sql = sqlPrefix || "";
  if (!body.cmd) {
    sqls.push(sqlPrefix);
    return sqls;
  }
  switch(body.cmd) {
  case "get-records":
    if (body.sort && body.sort.length) {
      var tmp = [];
      body.sort.forEach(function(item) {
        tmp.push("  " + item.field + " " + item.direction);
      });
      sql += "order by " + tmp.join() + " ";
    }
    if (body.limit) sql += "limit " + body.limit + " ";
    if (body.offset) sql += "offset " + body.offset + " ";
    sqls.push(sql);
  break;
  case "delete-records":
    sqls.push("delete from users where recid in ('" + body.selected.join("','") + "')");
  break;
  case "save-records":
    body.changes.forEach(function(item) {
      var tmp_ = [];
      Object.keys(item).forEach(function(key) {
        if (key != "recid")
          if ("" == item[key]) {
            tmp_.push(key + " = null");
          } else {
            tmp_.push(key + " = '" + item[key] + "'");
          }
      });
      sqls.push("update users set " + tmp_.join() + " where recid = '" + item.recid + "'");
    });
  break;
  default:
    _logger.error(body.cmd);
  break;
  }
  return sqls;
};

router.get('/:target.:format', function(req, res, next) {
  _logger.debug(req.params.format);
  _pg.connect(_config.db.url, function(err, cli, done) {
    if (err) return errorToNext(err, next, 500, done);
    var sql = "select * from " + req.params.target;
    _logger.debug(sql);
    cli.query(sql, function(err, data) {
      if (err) return errorToNext(err, next, 500, done);
      done();
      switch (req.params.format) {
      case "csv":
        res.type("text/comma-separated-values");
        var keys = null;
        var csv  = null;
        data.rows.forEach(function(row, index) {
          if (0 == index) {
            keys = Object.keys(row);
            csv = '"' + keys.join('","') + '"\n';
          }
          var tmp = [];
          keys.forEach(function(key) {
            tmp.push(row[key]);
          });
          csv += '"' + tmp.join('","') + '"\n';
          // 最後に送信
          if ((data.rows.length - 1) == index) res.send(csv);
        });
      case "json":
        res.json(data.rows);
      break;
      default:
        return errorToNext(err, next, 400, done);
      }
    });
  });
});

router.post('/:target.json', function(req, res, next) {
  _logger.debug(req.body);
  _pg.connect(_config.db.url, function(err, cli, done) {
    if (err) return errorToNext(err, next, 500, done);
    var sqls = createSql(req.body, "select * from " + req.params.target +" ");
    _logger.debug(sqls.join(';'));
    cli.query(sqls.join(';'), function(err, data) {
      if (err) return errorToNext(err, next, 500, done);
      done();
      res.json({total: data.rows.length, records: data.rows});
    });
  });
});

router.post('/new/id.json', function(req, res, next) {
  _pg.connect(_config.db.url, function(err, cli, done) {
    if (err) return errorToNext(err, next, 500, done);
    var sql = "insert into users values (default) returning recid";
    cli.query(sql, function(err, data) {
      if (err) return errorToNext(err, next, 500, done);
      done();
      res.json(data.rows[0]);
    });
  });
});

module.exports = router;
