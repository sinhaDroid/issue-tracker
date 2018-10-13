/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

module.exports = app => {
  MongoClient.connect(process.env.DB, (err, db) => {
    if(err) {
      console.log(err);
    } else {
      app.route('/api/issues/:project')
        .get((req, res) => {
          const query = {};
          if(req.query.issue_title) query.issue_title = req.query.issue_title;
          if(req.query.issue_text) query.issue_text = req.query.issue_text;
          if(req.query.created_by) query.created_by = req.query.created_by;
          if(req.query.assigned_to) query.assigned_to = req.query.assigned_to;
          if(req.query.status_text) query.status_text = req.query.status_text;
          if(req.query.created_on) query.created_on = req.query.created_on;
          if(req.query.updated_on) query.updated_on = req.query.updated_on;
          if(req.query.open) query.open = req.query.open === 'true';
          db.collection(req.params.project).find(query).toArray((err, result) => {
            if(err) {
              console.log(err);
            } else {
              res.send(result);
            }
          });
        })
        .post((req, res) => {
          const date = new Date();
          if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
            res.send('missing inputs');
          } else {
            db.collection(req.params.project).insertOne(
              {
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to,
                status_text: req.body.status_text,
                created_on: date.toISOString(),
                updated_on: date.toISOString(), 
                open: true
              }, 
              (err, result) => {
                if(err) {
                  console.log(err);
                } else {
                  res.send(result.ops[0]);
                }
              }                            
            );
          }
        })
        .put((req, res) => {
          const update = {};
          let updateExists = false;
          if(req.body.issue_title && req.body.issue_title !== '') {
            update.issue_title = req.body.issue_title;
            updateExists = true;
          }
          if(req.body.issue_text && req.body.issue_text !== '') {
            update.issue_text = req.body.issue_text;
            updateExists = true;
          }
          if(req.body.created_by && req.body.created_by !== '') {
            update.created_by = req.body.created_by;
            updateExists = true;
          }
          if(req.body.assigned_to && req.body.assigned_to !== '') {
            update.assigned_to = req.body.assigned_to;
            updateExists = true;
          }
          if(req.body.status_text && req.body.status_text !== '') {
            update.status_text = req.body.status_text;
            updateExists = true;
          }
          if(req.body.open) {
            update.open = false;
            updateExists = true;
          }
          if(updateExists) {
            update.updated_on = new Date().toISOString();
            db.collection(req.params.project).updateOne({_id: new ObjectId(req.body._id)}, 
              {$set: update},
              (err, result) => {
                if(err) {
                  console.log(err);
                  res.send('could not update' + req.body._id);
                } else {
                  res.send('successfully updated');
                }
              }
            );
          } else {
            res.send('no updated field sent');
          }
        })
        .delete((req, res) => {
          if(!req.body._id) {
            res.send('_id error');
          } else {
            db.collection(req.params.project).deleteOne({_id: new ObjectId(req.body._id)}, 
              (err, result) => {
                if(err) {
                  console.log(err);
                  res.send('could not delete' + req.body._id);
                } else {
                  res.send('deleted '+ req.body._id);
                }
              }
            );
          }
        });
      
      //404 Not Found Middleware
      app.use((req, res, next) =>  {
        res.status(404)
        .type('text')
        .send('Not Found');
      });
    }
  });
};
