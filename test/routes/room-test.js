// william wall
"use strict";
import mongoose from 'mongoose'
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
var RoomSchema = require('mongoose').model('Room').schema;

const Room = mongoose.model("Room", RoomSchema);

describe('Rooms', function () {

    let someRoom;
    beforeEach((done) => {
        someRoom = new Room(
            {
                room_name: 'Room 1'
            });
        someRoom.save().then(() => done());
    });

    describe('GET /api/rooms', () => {

        describe('Getting Rooms', () => {

            describe('Return all Rooms', () => {

                it('should return all of the rooms objects', function (done) {
                    let aRoom = new Room({room_name: 'Room 2'});
                    aRoom.save()
                    chai.request(app)
                        .get('/api/rooms/')
                        .end((err, res) => {
                            let result = _.map(res.body, (rooms) => {
                                return {
                                    room_name: rooms.room_name,
                                }
                            });
                            expect(res).to.have.status(200);
                            expect(result).to.be.a('array');
                            expect(result).to.include({room_name: 'Room 1'});
                            expect(result).to.include({room_name: 'Room 2'});
                            done();
                        });
                });
            });
            describe('Error Handling', () => {

                it('should throw a 500 error for incorrect id', function (done) {
                    chai.request(app)
                        .get('/api/rooms/12')
                        .end(function (err, res) {
                            expect(res).to.have.status(500);
                            done();
                        });
                });
            });
            describe('Return Single Room by ID', () => {

                it('should return a single object by its id', function (done) {
                    let singleRoom = new Room({room_name: 'Single Room'});
                    singleRoom.save()
                    chai.request(app)
                        .get('/api/rooms/' + singleRoom._id)
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(singleRoom).to.be.a('object');
                            expect(singleRoom.room_name).to.equal('Single Room');
                            done();
                        });
                });
            });
        });
    });
    describe('POST /rooms', () => {

        describe('Adding Rooms', () => {

            it('should add room to database and verify', function (done) {
                let newRoom = {
                    room_name: 'New Room'
                };
                chai.request(app)
                    .post('/api/rooms/')
                    .send(newRoom)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        done();
                    });
            });
            after(function (done) {
                chai.request(app)
                    .get('/api/rooms/')
                    .end(function (err, res) {
                        let result = _.map(res.body, (newRoom) => {
                            return {
                                room_name: newRoom.room_name
                            };
                        });
                        expect(res).to.have.status(200);
                        expect(result).to.be.a('array');
                        expect(result).to.include({room_name: 'New Room'});
                        done();
                    });
            });

        });

    });

    describe('PUT /rooms', () => {

        describe('Updating Rooms', () => {

            describe('Update Single Room by ID', () => {

                it('should update a specific record by id and verify its added to the database', (done) => {
                    let updateRoom = {
                        room_name: 'Updated Room'
                    };
                    chai.request(app)
                        .get('/api/rooms/')
                        .end(function (err, res) {
                            expect(res).to.have.status(200);
                            chai.request(app)
                                .put('/api/rooms/' + res.body[0]._id)
                                .send(updateRoom)
                                .end(function (error, response) {
                                    expect(res).to.have.status(200);
                                    done();
                                });
                        });
                });
                after(function (done) {
                    chai.request(app)
                        .get('/api/rooms/')
                        .end(function (err, res) {
                            let result = _.map(res.body, (rooms) => {
                                return {
                                    room_name: rooms.room_name,
                                };
                            });
                            expect(res).to.have.status(200);
                            expect(result).to.be.a('array');
                            expect(result).to.include({room_name: 'Updated Room'});
                            done();
                        });
                });
            });
            describe('Error Handling', () => {

                it('should not update anything and get status 500 for incorrect id', function (done) {
                    let updateRoom = {
                        room_name: 'Updated Room'
                    };
                    chai.request(app)
                        .get('/api/rooms/')
                        .end(function (err, res) {
                            chai.request(app)
                                .put('/api/rooms/12')
                                .send(updateRoom)
                                .end(function (err, res) {
                                    expect(res).to.have.status(500);
                                    done();
                                });
                        });
                });
            });

        });

    });
    describe('DELETE /rooms', () => {
        let aRoom = new Room({room_name: 'Room delete-test'});
        aRoom.save()
        describe('Deleting Rooms', () => {


            describe('Delete Single Room by ID', () => {

                it('should delete room by id and remove the object instance', function (done) {
                    chai.request(app)
                        .get('/api/rooms/')
                        .end(function (err, res) {
                            chai.request(app)
                                .delete('/api/rooms/' + aRoom._id)
                                .end(function (err, res) {
                                    expect(res).to.have.status(200);
                                    done();
                                });
                        });
                });
                after(function (done) {
                    chai.request(app)
                        .get('/api/rooms/')
                        .end(function (err, res) {
                            expect(res).to.have.status(200);
                            expect(res.body).be.be.a('array');
                            let result = _.map(res.body, (rooms) => {
                                return {
                                    room_name: rooms.room_name
                                };
                            });
                            expect(result).to.not.include({room_name: 'Room delete-test'});
                            done();
                        })
                })
            });
            describe('Error Handling', () => {

                it('should not delete anything and get status 500 for incorrect id', function (done) {
                    chai.request(app)
                        .get('/api/rooms/')
                        .end(function (err, res) {
                            chai.request(app)
                                .delete('/api/rooms/12')
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