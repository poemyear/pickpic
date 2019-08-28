const db = require('../db');

// /db.connect();

exports.index = (req, res) => {
    console.log("controller.js - index");
    return db.fetchUsers(req)
        .then((result)=>{
            res.send(result);
        }).catch((err) => {
            console.log(err);
            res.status(400).json({error: 'Invalid id'});
        });
};

exports.show = (req, res) => {
    console.log("controller.js - show");
    // const id = parseInt(req.params.id, 10);
    // if (!id) {
    //     return res.status(400).json({error: 'Invalid id'});
    // }
    db.fetc(req.params.id)
        .then((result)=> {
            res.send(result);
        }).catch((err) => {
            console.error(err);
            res.status(400).json({error: 'Invalid id'});
        });
};

exports.create = (req, res) => {
    console.log("controller.js - create");
    db.createUser(req.body.id, req.body.password)
        .then((result) => {
            console.log("result:" + result);
            res.status(200).send(result);
        }).catch((err) => {console
        .error(err); res.status(400).json({error: 'already exist'}) });
};

exports.update = (req, res) => {
    console.log("controller.js - updateEvent");
    const id = req.body.id;
    if (!id.length) {
        return res.status(400).json({error: 'Invalid id'});
    }
    db.updateEvent(id).then(res.status(201).send(id));
};

exports.destroy = (req, res) => {
    console.log("controller.js - destroy");
    db.deleteUser(req.body.id).then(res.send());
};
