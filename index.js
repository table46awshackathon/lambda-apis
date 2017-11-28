"use strict";

const _ = require('lodash');
const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01', region: 'us-west-2'});
var csv = require('csv');

exports.handler = function(event, context, callback) {
  console.log(JSON.stringify(event));

  const bucket = 'table46hackathondata';
  var key = 'pii/SamplePFT500Rows.csv';

  if (event.queryStringParameters && event.queryStringParameters.source) {
    key = event.queryStringParameters.source;
  }

  loadData(bucket, key)
    .then(convertData)
    .then((data) => {
      var response = {
          statusCode: 200,
          headers: {
              'Access-Control-Allow-Origin': "*"
          },
          body: JSON.stringify(data)
      };
      console.log("response: " + JSON.stringify(response))
      callback(null, response);
    })
    .catch(error => {
      console.log(error);
      var response = {
          statusCode: 404,
          headers: {
              'Access-Control-Allow-Origin': "*"
          },
          body: `File not found: ${key}`
      };
      callback(null, response);
    });
}

function loadData(bucket, key) {
  console.log(`Load csv from ${bucket} :: ${key}`);
  const params = {
      Bucket: bucket,
      Key: key,
  };
  return s3.getObject(params).promise();
}

function convertData(data) {
  return new Promise((resolve, reject) => {
    csv.parse(data.Body.toString(), {columns: true}, function(err, data) {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}
