// william wall
"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;

const ReviewSchema = new Schema({
    title: String,
    description: String
});

const Review = mongoose.model("Review", ReviewSchema);

describe('mLab Cloud Database Tests', function() {
    before(function (done) {
        mongoose.connect('mongodb://will:william1@ds125341.mlab.com:25341/post-app');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function() {
            console.log('We are connected to test database!');
            done();
        });
    });
    describe('Test Database Connection By Adding a Review', function() {
        it('New review saved to test database', function(done) {
            var testReview = new Review({
                title: "Opel Vectra 2009 1.6",
                description: "Very slow, bad on petrol"
            });
            testReview.save(done);
            // console.log(testReview);
        });
    });
    describe('Verify That The Review Got Added To Database', function() {
        it('Should retrieve data from test database', function(done) {
            Review.find({title: 'Opel Vectra 2009 1.6', description: "Very slow, bad on petrol"}, (err, title) => {
                if(err) {throw err;}
                if(title.length === 0) {throw new Error('No data!');}
                done();
            });
        });
    });
    after(function(done){
        mongoose.connection.db.dropDatabase(function(){
            mongoose.connection.close(done);
        });
    });
});
