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

var ChatSchema = require('mongoose').model('Chat').schema;

const Chat = mongoose.model("Chat", ChatSchema);

describe('Chat', function () {
    before(function (done) {

        var testChat = new Chat({
            room: '5bd04dc76067682a204fc3ed',
            nickname: 'Will',
            message: 'Hello'
        });
        testChat.save(done);
    });


    describe('GET /api/chats', () => {

        describe('Getting Chats', () => {

            describe('Return all Chats', () => {

                it('should return all of the rooms objects', function (done) {
                    let aChat = new Chat({
                        room: '5bd04dc76067682a204fc3ed',
                        nickname: 'Ger',
                        message: 'Hello, will im new here!'
                    });
                    aChat.save()
                    chai.request(app)
                        .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                        .end((err, res) => {
                            let result = _.map(res.body, (chats) => {
                                return {
                                    nickname: chats.nickname,
                                    message: chats.message
                                }
                            });
                            expect(res).to.have.status(200);
                            expect(res).to.be.a('object');
                            expect(result).to.include({nickname: 'Will', message: 'Hello'});
                            expect(result).to.include({nickname: 'Ger', message: 'Hello, will im new here!'});
                            expect(res.body.length).to.equal(2);
                            done();
                        });
                });
            });
            describe('Return Single Chat by ID', () => {

                it('should return a single object by its id', function (done) {
                    let singleChat = new Chat({
                        room: '5bd04dc76067682a204fc3ed',
                        nickname: 'Joan',
                        message: 'Im new here'
                    });
                    singleChat.save()
                    chai.request(app)
                        .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                        .end(function (err, res) {
                            chai.request(app)
                                .get('/api/chats/' + singleChat._id)
                                .end((err, res) => {
                                    expect(res).to.have.status(200);
                                    expect(res).to.be.a('object');
                                    expect(singleChat.nickname).to.equal('Joan');
                                    done();
                                });
                        });
                });
            });
            describe('Error Handling', () => {


                it('should throw a 500 error for incorrect id', function (done) {
                    chai.request(app)
                        .get('/api/chats/12')
                        .end(function (err, res) {
                            expect(res).to.have.status(500);
                            done();
                        });
                });
            });
        });
    });

    describe('POST /api/chats', function () {

        describe('Adding Chats', function () {

            it('should add chat to database directly to a specific room, verify and get correct message from post function', function (done) {
                let someChat = {
                    room: '5bd04dc76067682a204fc3ed', nickname: 'Joan', message: 'Im new here'
                };
                chai.request(app)
                    .post('/api/chats/')
                    .send(someChat)
                    .end(function (err, res) {
                        expect(res).to.have.status(200);
                        done();
                    });
            });
            after(function (done) {
                chai.request(app)
                    .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                    .end(function (err, res) {
                        let result = _.map(res.body, (chats) => {
                            return {
                                nickname: chats.nickname,
                                message: chats.message
                            }
                        });
                        expect(res).to.be.a('object');
                        expect(res).to.have.status(200);
                        expect(result).to.include({nickname: 'Joan', message: 'Im new here'});
                        done();
                    });
            });
        });
    });

    describe('PUT /api/chats', () => {

        describe('Update Single Chat by ID', () => {

            it('should update a specific record by id and verify its added to the database', (done) => {
                let updateChat = {
                    nickname: 'Emma', message: 'Updating chat message'
                };
                chai.request(app)
                    .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                    .end(function (err, res) {
                        chai.request(app)
                            .put('/api/chats/' + res.body[0]._id)
                            .send(updateChat)
                            .end(function (err, res) {
                                expect(res).to.have.status(200);
                                done();
                            });
                    });
            });
            after(function (done) {
                chai.request(app)
                    .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                    .end(function (err, res) {
                        let result = _.map(res.body, (chats) => {
                            return {
                                nickname: chats.nickname,
                                message: chats.message
                            }
                        });
                        expect(res).to.be.a('object');
                        expect(result).to.include({nickname: 'Emma', message: 'Updating chat message'});
                        expect(res).to.have.status(200);
                        done();
                    });
            });
            describe('Error Handling', () => {

                it('should not update anything and get status 500 for incorrect id', function (done) {
                    let updateChat = {
                        nickname: 'Emma', message: 'Updating chat message'
                    };
                    chai.request(app)
                        .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                        .end(function (err, res) {
                            chai.request(app)
                                .put('/api/chats/12')
                                .send(updateChat)
                                .end(function (err, res) {
                                    expect(res).to.have.status(500);
                                    done();
                                });
                        });
                });
            });
        });

    });

    describe('DELETE /api/chats', () => {
        let deleteChat = new Chat({nickname: 'Sarah', message: 'Delete chat message'});
        deleteChat.save()
        describe('Delete Single Chat by ID', () => {

            it('should delete chat by id and remove the object instance', function (done) {
                chai.request(app)
                    .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                    .end(function (err, res) {
                        chai.request(app)
                            .delete('/api/chats/' + deleteChat._id)
                            .end(function (err, res) {
                                expect(res).to.have.status(200);
                                done();
                            });
                    });
            });
            after(function (done) {
                chai.request(app)
                    .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                    .end(function (err, res) {
                        let result = _.map(res.body, (rooms) => {
                            return {
                                room_name: rooms.room_name
                            };
                        });
                        expect(res).to.have.status(200);
                        expect(res.body).be.be.a('array');
                        expect(result).to.not.include({room_name: 'Room delete-test'});
                        done();
                    })
            })
        });
        describe('Error Handling', () => {

            it('should not delete anything and get status 500 for incorrect id', function (done) {
                chai.request(app)
                    .get('/api/chats/' + '5bd04dc76067682a204fc3ed')
                    .end(function (err, res) {
                        chai.request(app)
                            .delete('/api/chats/12')
                            .end(function (err, res) {
                                expect(res).to.have.status(500);
                                done();
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