var mongoose = require('mongoose');
var moment = require('moment');
var Agenda = require('agenda');

var expirePhotoHandler = new Agenda({db: { address: 'mongodb://localhost:27017/expirePhoto'}});

expirePhotoHandler.define('changeStatus', async function(job, done){
    console.log('changeStatus');
    events = await Event.find({status: 'voting', expireAt:{$lt:Date.now()}});
    for(let event of events){
        event.status="expired";
        event.save(function(err){
            if( err ){

            }
        });
    }
    console.log(result);
    done();
});
expirePhotoHandler.on('ready', function() {
    expirePhotoHandler.every('3 seconds', 'changeStatus');
    expirePhotoHandler.start();
});

/* DB Schema */
const EventSchema = new mongoose.Schema({
    owner : 'string',
    createdAt: Date,
    expireAt: Date,
    status: 'string',
    photos : [mongoose.Schema({
        path : 'string',
        filename : 'string'
    })]
});

var Event = mongoose.model('Event', EventSchema);
var User = mongoose.model('User', mongoose.Schema({
    name: 'string'
}));

var Vote = mongoose.model('Vote', mongoose.Schema({
    voter: 'string',
    eventId : 'string',
    photoId : 'string',
    votedAt: Date
}));

/* Connect to DB */
exports.connect = () => {
    console.log("db.js - connect");
    mongoose.connect('mongodb://localhost:27017/db');
    var db = mongoose.connection;
    db.on('error', function(){
        console.log('Connection Failed!');
    });
    db.once('open', function() {
        console.log('Connected!');
    });
}

exports.createEvent = (owner, photos) => {
    console.log("db.js - createEvent");
    var newEvent = new Event({
        owner: owner,
        createdAt: Date.now(),
        expireAt: moment().add(3600*24*2, 'second'),
        status: 'voting',
        photos: photos
    });

    return new Promise((resolve, reject) => {
        newEvent.save(function(error, data){
            if(error){
                console.error(error);
                reject(error);
            }else{
                console.log('Saved!')
                console.info(data);
                resolve(data);
            }
        })
    });
}

exports.fetchEvents = (req) => {
    console.log("db.js - fetchEvents");

    return Event.find();
}

exports.readEvent = (id) =>{
    console.debug("db.js - readEvent");

    return new Promise((resolve, reject) => {
        Event.findOne({ _id: id }, (err, event) => {
            console.log('--- Read one ---');
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.info(event);
                resolve(event);
            }
        })
    });
}

exports.aggregateVotes = (eventId) =>{
    console.debug("db.js - aggregateVotes");

    return new Promise((resolve, reject) => {
        Vote.aggregate([
            { $match: {eventId}},
            { $group:
                { _id: "$photoId",
                count: { $sum: 1 }
            }
            }], (err, event) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.info(event);
                resolve(event);
            }
        })
    });
}

/* Vote */

exports.createVote = (voter, eventId, photoId) => {
    console.log("db.js - createEvent");
    var newVote = new Vote({voter, eventId, photoId, votedAt:Date.now()});

    /* TODO: Validate voter, eventId, photoId */
    return new Promise((resolve, reject) => {
        newVote.save(function(error, data){
            if(error){
                console.error(error);
                reject(error);
            }else{
                console.info(data);
                resolve(data);
            }
        })
    });
}





/* Users */

exports.fetchUsers = () => {
    console.debug("db.js - fetchUsers");
    return User.find();
}

exports.createUser = (name) => {
    console.debug("db.js - createUser");
    return new Promise((resolve, reject) => {
        new User({name}).save((error, data) => {
            if(error){
                console.error(error);
                reject(error);
            }else{
                console.debug(data);
                resolve(data);
            }
        })
    });
}

exports.deleteUser = async (id) => {
    console.debug("db.js - deleteUser");
    return await User.remove({_id: id}, (error, output) => {
        if (error)
            console.error(error);
        else
            console.info(output);
    });
}




/* TODO: */


exports.deleteEvent = async (id) => {
    console.log("db.js - deleteEvent");

    var ret;
    ret = await Event.remove({id: id}, (error, output) => {
        if (error) {
            console.log(error);
        }
    });
    return ret['ok'];
}

/* Deprecated */
exports.updateEvent = async (id) => {
    console.log("db.js - updateEvent");

    // var ret;
    // ret = Event.findById({id:id}, function(error,event){
    //     if(error){
    //         console.log(error);
    //     }else{
    //         event.id = '2';
    //         event.createEvent(function(error,modified_event){
    //             if(error){
    //                 console.log(error);
    //             }else{
    //                 console.log(modified_event);
    //             }
    //         });
    //     }
    // });
    // return ret;
}

