
const db = require('../db');

// /db.connect();

validatePatch = (field, input, output) => {
    if (input.hasOwnProperty(field))
        output[field] = input[field];
}

exports.patch = (req, res) => {
    console.log("controller.js - patch");
    const userId = req.body.id;
    let patchData = {}
    validatePatch('pushStatus', req.body, patchData);
    console.debug('patchData: ', patchData);

    return db.patchUser(userId, patchData)
        .then((result) => {
            console.log(result); // patch 되기 전 result
            res.status(204).send();
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
    id = id.toLowerCase();
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
