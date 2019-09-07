const db = require('../db');

// db.connect();

exports.index = (req, res) => {
    console.log("controller.js - index");
    return db.fetchEvents(req.headers.userid)

        .then((result)=> {
            res.send(result);
        }).catch((err) => {
            console.error(err);
           res.status(400).json({error: 'Invalid id'});
        });
    // return res.send*

    // return db.fetchEvents(req).then((result)=>{res.send(result)});
};

exports.show = (req, res) => {
    console.log("controller.js - show");
    // const id = parseInt(req.params.id, 10);
    // if (!id) {
    //     return res.status(400).json({error: 'Invalid id'});
    // }
    db.readEvent(req.params.eventId)
        .then((result) => {
            res.send(result);
        }).catch((err) => {
            console.error(err);
            res.status(400).json({ error: 'Invalid id' });
        });
};

exports.create = (req, res) => {
    console.log("controller.js - create");
    const owner = req.body.owner;
    const title = req.body.title;
    const expiredAt = req.body.expiredAt;
    if (!owner || !owner.length) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    if (!title || !title.length) {
        return res.status(400).json({ error: 'Invalid Title' });
    }
    if (!expiredAt || !expiredAt.length) {
        return res.status(400).json({ error: 'Invalid expiredAt' });
    }

    if (req.files.length < 2) {
        console.error("photo uploaded less than 2");
        return res.status(400).json({ error: 'Upload at least 2 photos' })
    }

    db.createEvent(owner, title, expiredAt, req.files)
        .then((result) => {
            console.debug(req.headers);
            console.debug(req.body);
            console.log("result:" + result);;
            res.status(200).json(result);
        }).catch((err) => {
            console
                .error(err); res.status(400);
        });
};

exports.status = (req, res) => {
    console.log("controller.js - create");
    const eventId = req.params.eventId;

    db.readEvent(eventId).then((result) => {
        db.aggregateVotes(eventId)
            .then((aggrResult) => {
                let ret = result.photos.map(photo => {
                    let photoId = photo.id;
                    let count = 0;
                    for (let aggr of aggrResult) {
                        if (photoId == aggr._id) {
                            count = aggr.count;
                            break;
                        }
                    }
                    return { _id: photo._id, path: photo.path, count, thumbnailPath: photo.thumbnailPath };
                });
                res.status(200).json({ title: result.title, status: result.status, createdAt:result.createdAt, expiredAt:result.expiredAt, result: ret});
            }).catch((err) => {
                console
                    .error(err); res.status(400);
            });
    }
    )
};

exports.vote = (req, res) => {
    console.log("controller.js - pick");
    const voter = req.body.voter;
    const eventId = req.params.eventId;
    const photoId = req.params.photoId;

    /* TODO: Validate */

    db.createVote(voter, eventId, photoId)
        .then((result) => {
            console.debug("result:" + result);
            res.status(200).send(result);
        }).catch((err) => {
            console.error(err);
            res.status(400).send(err);
        });
};

exports.update = (req, res) => {
    console.log("controller.js - updateEvent");
    const id = req.body.id;
    if (!id.length) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    db.updateEvent(id).then(res.status(201).send(id));
};

exports.destroy = (req, res) => {
    console.log("controller.js - destroy");
    const id = parseInt(req.params.id, 10);
    if (!id) {
        return res.status(400).json({ error: 'Incorrect id' });
    }

    db.deleteEvent(id).then((result) => {
        if (result == id) {
            res.status(204).send();
        } else {
            res.status(400).json({ error: 'Invalid id' });
        }
    })
};
