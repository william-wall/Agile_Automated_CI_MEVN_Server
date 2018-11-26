// william wall
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
// const app = express()
var createError = require('http-errors')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
app.use(bodyParser.json())
app.use(cors())

var room = require('../routes/room')
var chat = require('../routes/chat')

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/MEVN-boilerplate', {
    // mongodb://will:william1@ds125341.mlab.com:25341/post-app
    useNewUrlParser: true,
    promiseLibrary: require('bluebird')
})
    .then(() => console.log('mLab Connection Successful'))
    .catch((err) => console.error(err));

const mongodb_conn_module = require('./mongodbConnModule');
var db = mongodb_conn_module.connect();

var Review = require("../models/Review");
var Chat = require('../models/Chat.js');



if (process.env.NODE_ENV === 'test') {
    app.use(logger('dev'));
}
// if (app.get('env') !== 'test') {
//     app.use(logger('dev'));
// }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended': 'false'}));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/rooms', express.static(path.join(__dirname, 'dist')));
app.use('/api/rooms', room);
// app.use('/api/chats', chat);

io.on('connection', function (socket) {
    console.log('User connected');
    socket.on('disconnect', function() {
        console.log('User disconnected');
    });
    socket.on('save-message', function (data) {
        console.log(data);
        io.emit('new-message', { message: data });
    });
});

/* GET ALL CHATS */
app.get('/:roomid', function(req, res, next) {
    Chat.find({ room: req.params.roomid }, function (err, products) {
        if (err) return next(err);
        res.json(products);
    });
});

/* GET SINGLE CHAT BY ID */
app.get('/:id', function(req, res, next) {
    Chat.findById(req.params.id, function (err, post) {
        if (err) return res.sendStatus(500);
        res.json(post);
    });
});

/* SAVE CHAT */
app.post('/', function(req, res, next) {
    Chat.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE CHAT */
app.put('/:id', function(req, res, next) {
    Chat.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return res.sendStatus(500);
        res.json(post);
    });
});

/* DELETE CHAT */
app.delete('/:id', function(req, res, next) {
    Chat.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return res.sendStatus(500);
        res.json(post);
    });
});

/* GET ALL REVIEWS */
app.get('/reviews', (req, res) => {
    Review.find({}, 'title description', function (error, reviews) {
        if (error) {
            console.error(error);
        }
        res.send({
            reviews: reviews,
            success: true
        })
    }).sort({_id: -1})
})

/* ADD ROOM */
app.post('/reviews', (req, res) => {
    var db = req.db;
    var title = req.body.title;
    var description = req.body.description;
    var new_review = new Review({
        title: title,
        description: description
    })
    new_review.save(function (error) {
        if (error) {
            console.log('Review did NOT add successfully!')
            console.log(error)
        }
        res.send({
            success: true
        })
    })
})

/* UPDATE REVIEW */
app.put('/reviews/:id', (req, res) => {
    var db = req.db;
    Review.findById(req.params.id, 'title description', function (error, review) {
        if (error) {
            return res.sendStatus(500);
        }
        review.title = req.body.title;
        review.description = req.body.description;
        review.save(function (error) {
            if (error) {
                console.log(error)
            }
            res.send({
                success: true
            })
        })
    })
})

/* DELETE REVIEW */
app.delete('/reviews/:id', (req, res, error) => {
    var db = req.db;
    Review.remove({
        _id: req.params.id
    }, function (err, review) {
        if (err)
            return res.sendStatus(500);
        res.send({
            success: true
        })
    })
})

/* GET REVIEW BY SINGLE ID */
app.get('/reviews/:id', (req, res) => {
    var db = req.db;
    Review.findById(req.params.id, 'title description', function (error, review) {
        if (error) {
            return res.sendStatus(500);
        }
        res.send(review)
    })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err.status);
});

module.exports = app;

server.listen(process.env.PORT || 8081)