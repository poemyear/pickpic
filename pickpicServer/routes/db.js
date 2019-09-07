var mongoose = require('mongoose');
var moment = require('moment');
var Agenda = require('agenda');
var ObjectId = require('mongoose').Types.ObjectId;

var expirePhotoHandler = new Agenda({db: { address: 'mongodb://localhost:27017/expirePhoto'}});

expirePhotoHandler.define('changeStatus', async function(job, done){
    console.log('changeStatus');
    events = await Event.find({status: 'voting', expiredAt:{$lt:Date.now()}});
    for(let event of events){
        event.status="expired";
        event.save(function(err){
            if( err ){

            }
        });
    }
    done();
});
expirePhotoHandler.on('ready', function() {
    expirePhotoHandler.every('3 seconds', 'changeStatus');
    expirePhotoHandler.start();
});

/* DB Schema */
const EventSchema = new mongoose.Schema({
    title : 'string',
    owner : 'string',
    createdAt: Date,
    expiredAt: Date,
    status: 'string',
    voters: [],
    photos : [mongoose.Schema({
        path : 'string',
        filename : 'string',
        thumbnail: 'string',
        thumbnailPath: 'string'
    })]
});

var Event = mongoose.model('Event', EventSchema);
var User = mongoose.model('User', mongoose.Schema({
    id: 'string',
    password: 'string',
    pushStatus : 'boolean'
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

exports.createEvent = (owner, title, expiredAt, photos) => {
    console.log("db.js - createEvent");

    var newEvent = new Event({
        title: title,
        owner: owner,
        createdAt: Date.now(),
        expiredAt: moment(expiredAt),
        status: 'voting',
        voters: [],
        photos: photos
    });

    return new Promise((resolve, reject) => {
        newEvent.save(function(error, data){
            if(error){
                console.error(error);
                reject(error);
            }else{
                resolve(data);
            }
        })
    });
}

exports.fetchEvents = async (id) => {
    console.log("db.js - fetchEvents");

    return Event.find({
                        "owner": { $ne: id }, 
                        "voters": { $ne: id }, 
                        "photos.0": { "$exists": true }, 
                        "status": "voting" })
                .sort({ 'createdAt': -1 })
                .limit(10);
}

exports.readEvent = (id) =>{
    console.debug("db.js - readEvent");

    return new Promise((resolve, reject) => {
        Event.findOne({ _id: id }, (err, event) => {
            console.log('--- Read one ---');
            if (err) {
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

exports.createVote = async (voter, eventId, photoId) => {
    console.log("db.js - createVote");
    let event = await Event.findOne({_id:ObjectId(eventId)});
    if ( event == undefined || event.status != 'voting' )
        return Promise.reject( 'EventExpiredError' );

    if ( event.voters.indexOf( voter ) != -1 )
        return Promise.reject( 'VoteAlreadyError' );

    const newVote = new Vote({voter, eventId, photoId, votedAt:Date.now()});

    return new Promise (( resolve, reject ) => {
        newVote.save( (error, data) => {
            if( error ) {
                reject( 'VoteInternalError' );
            }
            else {
                event.voters.push(voter);
                event.save();

                resolve(data);
            }
        });
    });
}

/* Users */

exports.fetchUsers = () => {
    console.debug("db.js - fetchUsers");

    return User.find();
}

exports.loginUser = (id,password) => {
    console.debug("db.js - loginUser", id, password);

    return new Promise( (resolve, reject) => {
        User.find({id:id, password:password}, (error, data)=> {
            if( !data.length )
            {
                reject( 'NotExistedUser');
            }
            if( error ) {
                reject( 'LoginUserError' + error );
            }
            resolve(data);
        });
    })
}
exports.patchUser = (id, patchData) => {
    console.log("db.js - patchUser");

    return new Promise( ( resolve, reject ) => {
        User.findOneAndUpdate({id}, patchData, (err, result)=> {
            if( err ) reject( err );
            console.log(result);
            resolve( result );
        });
    });
}
exports.createUser = (id,password) => {
    console.debug("db.js - createUser", id, password);

    return new Promise( ( resolve, reject ) =>
    {
        User.findOne({id}, (err, result) => {
            if( result ) reject('UserAlreadyError');

            User.create({id, password, pushStatus:true }, (err, result) => {
                resolve( result );
            })
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

