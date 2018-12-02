// william wall
"use strict";
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import assert from 'assert';

import app from '../../src/app.js';
import chai from 'chai';
import chaiHttp from 'chai-http';
let expect = chai.expect;
let should = chai.should();


chai.use(chaiHttp);
import _ from 'lodash';
chai.use(require('chai-things'));
var ReviewSchema = require('mongoose').model('Review').schema;

const Review = mongoose.model("Review", ReviewSchema);

describe('Reviews', function () {

    let someReview;
    beforeEach((done) => {
        someReview = new Review({title: 'Review title 1', description: "Review description 1"});
        someReview.save()
            .then(() => done());
    });

    function assertReview(operation, done) {
        operation
            .then(() => Review.find({}))
            .then((reviews) => {
                done();
            });
    }

    describe('GET /reviews', () => {

        describe('Returning Reviews', () => {

            describe('Return all Reviews', () => {

                it('should return all of the reviews objects', function (done) {
                    chai.request(app)
                        .get('/reviews')
                        .end((err, res) => {
                            let result = _.map(res.body.reviews, (reviews) => {
                                return {
                                    title: reviews.title,
                                    description: reviews.description
                                }
                            });
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.a('object');
                            expect(result).to.include({title: 'Review title 1', description: 'Review description 1'});
                            expect(res.body.reviews.length).to.equal(2);
                            expect(res.body).to.have.property('success').equal(true);
                            done();
                        });
                });
            });
            describe('Return Single Review by ID', () => {

                it('should return a single object by its id', function (done) {
                    let singleReview = new Review({
                        title: 'single review title',
                        description: 'single review description'
                    });
                    singleReview.save()
                    chai.request(app)
                        .get('/reviews/' + singleReview._id)
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(singleReview).to.be.a('object');
                            expect(res.body.title).to.equal('single review title');
                            expect(singleReview).to.include({
                                title: 'single review title',
                                description: 'single review description'
                            });
                            done();
                        });
                });
                it('should find a user with a particular id', (done) => {
                    Review.findOne({_id: someReview._id})
                        .then((review) => {
                            assert(review.title === 'Review title 1');
                            done();
                        });
                });
            });
            describe('Error Handling', () => {

                it('should return a 500 status for incorrect id entered', function (done) {
                    chai.request(app)
                        .get('/reviews/12')
                        .end(function (err, res) {
                            expect(res).to.have.status(500);
                            done();
                        });
                });
            });

        });
    });

    describe('POST /reviews', function () {

        describe('Adding Reviews', function () {

            it('should save a review to database', function (done) {
                let addReview = new Review({title: 'Citroen', description: 'Great motor'});
                addReview.save()
                    .then(() => {
                        assert(!addReview.isNew);
                        done();
                    })
            });
            it('should add review to database, verify and get correct message from post request', function (done) {
                let addReview = {
                    title: 'Adding title',
                    description: 'Adding description',
                };
                chai.request(app)
                    .post('/reviews')
                    .send(addReview)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        expect(addReview).to.be.a('object');
                        expect(res.body).to.have.property('success').equal(true);
                        done();
                    });
            });
            after(function (done) {
                chai.request(app)
                    .get('/reviews')
                    .end(function (err, res) {
                        let result = _.map(res.body.reviews, (reviews) => {
                            return {
                                title: reviews.title,
                                description: reviews.description
                            };
                        });
                        expect(result).to.include({title: 'Adding title', description: 'Adding description'});
                        done();
                    });
            });
        });
    });


    // describe('PUT /reviews/:id', () => {
    //
    //     describe('Updating Reviews', function () {
    //
    //         describe('Error Handling', () => {
    //
    //             it('should not update anything and get status 500 for incorrect id', function (done) {
    //                 let updateReview = {
    //                     title: 'Updated Title',
    //                     description: 'Updated Description'
    //                 };
    //                 chai.request(app)
    //                     .get('/reviews')
    //                     .end(function (err, res) {
    //                         chai.request(app)
    //                             .put('/reviews/12')
    //                             .send(updateReview)
    //                             .end(function (err, res) {
    //                                 expect(res).to.have.status(500);
    //                                 done();
    //                             });
    //                     });
    //             });
    //         });
    //         it('should update an instance of review title', (done) => {
    //             someReview.set('title', 'Review title 2');
    //             assertReview(someReview.save(), done);
    //         });
    //         it('should update a specific record by choosing title', (done) => {
    //             assertReview(Review.update({title: 'Review title 1'},
    //                 {title: 'Updated review title'}), done);
    //         });
    //         describe('Update Single Review by ID', () => {
    //
    //             it('should update a specific record by id and verify its added to the database', (done) => {
    //                 let updateReview = {
    //                     title: 'Updated Title',
    //                     description: 'Updated Description'
    //                 };
    //                 chai.request(app)
    //                     .get('/reviews')
    //                     .end(function (err, res) {
    //                         chai.request(app)
    //                             .put('/reviews/' + someReview._id)
    //                             .send(updateReview)
    //                             .end(function (error, response) {
    //                                 expect(updateReview).to.be.a('object');
    //                                 expect(res.body).to.have.property('success').equal(true);
    //                                 expect(res).to.have.status(200);
    //                                 done();
    //                             });
    //                     });
    //             });
    //             after(function (done) {
    //                 chai.request(app)
    //                     .get('/reviews')
    //                     .end(function (err, res) {
    //                         let result = _.map(res.body.reviews, (reviews) => {
    //                             return {
    //                                 title: reviews.title,
    //                                 description: reviews.description
    //                             };
    //                         });
    //                         expect(result).to.include({title: 'Updated Title', description: 'Updated Description'});
    //                         done();
    //                     });
    //             });
    //         });
    //     });
    // });


    describe('DELETE /reviews/:id', () => {

        let deleteReview = new Review({title: 'Review title delete-test', description: 'Great motor'});
        deleteReview.save()
        describe('Deleting Reviews', function () {

            it('should remove instance of the model review', function (done) {
                deleteReview.remove()
                    .then(() => Review.findOne({title: 'Review title delete-test'}))
                    .then((review) => {
                        assert(review === null);
                        done();
                    });
            });
            it('should find review by its title and remove', (done) => {
                Review.findOneAndRemove({title: 'Citroen'})
                    .then(() => Review.findOne({title: 'Citroen'}))
                    .then((review) => {
                        assert(review === null);
                        done();
                    });
            });
            describe('Delete Single Review by ID', () => {

                it('should delete by id', function (done) {
                    chai.request(app)
                        .get('/reviews')
                        .end(function (err, res) {
                            chai.request(app)
                                .delete('/reviews/' + someReview._id)
                                .end(function (error, response) {
                                    response.should.have.status(200);
                                    response.should.be.json;
                                    response.body.should.be.a('object');
                                    done();
                                });
                        });
                });
                it('should delete specific database entry and check that it is removed', function (done) {
                    chai.request(app)
                        .get('/reviews')
                        .end(function (err, res) {
                            chai.request(app)
                                .delete('/reviews/' + deleteReview._id)
                                .end(function (err, res) {
                                    expect(res).to.have.status(200);
                                    expect(res.body).to.have.property('success').equal(true);
                                    let result = _.map(res.body.reviews, (reviews) => {
                                        return {
                                            title: reviews.title,
                                            description: reviews.description
                                        };
                                    });
                                    expect(result).to.not.include({
                                        title: 'Review title delete-test',
                                        description: 'Great motor'
                                    });
                                    done();
                                });
                        });
                });
            });
            describe('Error Handling', () => {

                it('should not delete anything and get status 500 for incorrect id', function (done) {
                    chai.request(app)
                        .get('/reviews')
                        .end(function (err, res) {
                            chai.request(app)
                                .delete('/reviews/12')
                                .end(function (err, res) {
                                    expect(res).to.have.status(500);
                                    done();
                                });
                        });
                });
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(function () {
            mongoose.connection.close(done);
        });
    });
});