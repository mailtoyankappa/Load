var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../agentactivationchatbotsnd2.zip');
var kuduApi = 'https://agentactivationchatbotsnd2.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$agentactivationchatbotsnd2';
var password = 'rPPBCvcs1TEe90uNvZkBz8LQqorKoE0h3ystlMHLF7TLeXmDmyw5XnSGj1bg';

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('agentactivationchatbotsnd2 publish');
  } else {
    console.error('failed to publish agentactivationchatbotsnd2', err);
  }
});