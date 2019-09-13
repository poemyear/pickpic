
const db = require('../db');

// /db.connect();

exports.patch = (req, res) => {
    console.log("controller.js - patch");
    var patchData = {}
    if( req.body.hasOwnProperty('pushStatus') ) {
        patchData['patchStatus'] = req.body.pushStatus;
    }
    console.log(patchData);
    return db.patchUser(req.body.id, patchData)
        .then((result) => {
            console.log(result);
            res.send(result);
        }).catch((err) => {
            console.log(err);
            res.status(400).json({error: 'Patch Error'});
        });
}

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
    db.getUser(req.params.id, req.query.param.split(','))
        .then((result)=> {
            res.send(result);
        }).catch((err) => {
            console.error(err);
            res.status(400).json({error: 'Invalid id'});
        });
};

exports.create = (req, res) => {
    console.log("controller.js - create");
    let id = req.body.id;
    let password = req.body.password;
    /* TODO: Validation */
    id.toLowerString();
    db.createUser(id, password)
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
