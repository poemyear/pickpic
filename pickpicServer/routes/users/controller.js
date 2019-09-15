
const db = require('../db');

// /db.connect();
changeUserInfo = (req, res, changeData) => {
    return db.patchUser(req.params.id, changeData)
        .then((result) => {
            console.log(result);
            res.status(200).send(result);
        }).catch((err) => {
            console.log(err);
            res.status(400).json({error: 'Patch Error'});
        });
}

validAndPatch= (field, validateFunc, input, output) => {
    if (input.hasOwnProperty(field) ) {
        if (validateFunc(input[field]))
            output[field] = input[field];
    }
}

validateToken = (input) => {
    if( typeof(input) != "string" )
        return false;
    return true;
}

validatePushStatus = (input) => {
    if( typeof(input) != "boolean" )
        return false;
    return true;
}

exports.patch = (req, res) => {
    console.log("controller.js - patch");
    var patchData = {};
    var appendData = {};

    validAndPatch( 'token', validateToken, req.body, appendData );
    validAndPatch( 'pushStatus', validatePushStatus, req.body, patchData );

    const changeData = {$push:appendData, $set:patchData};
    changeUserInfo( req, res, changeData );
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
    if ( req.query.hasOwnProperty('dupCheck') && req.query.dupCheck == 1 )
    {
        db.findUser(req.params.id)
            .then((result) => {
                res.json({resp:result});
            }).catch((err) => {
               console.error(err);
               res.status(400).json({error: 'Bad Request'});
        })
    }
    else {
        /* TODO : Check Authorization for getting user information */
        db.getUser(req.params.id, req.query.param.split(','))
            .then((result) => {
                res.send(result);
            }).catch((err) => {
            console.error(err);
            res.status(400).json({error: 'Invalid id'});
        });
    }
};

exports.create = (req, res) => {
    console.log("controller.js - create");
    let id = req.body.id;
    let password = req.body.password;
    let nickname = req.body.nickname;
    let sex = req.body.sex;
    let birthday = req.body.birthday;
    /* TODO: Validation */
    id = id.toLowerCase();
    db.createUser(id, password, nickname, sex, birthday)
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
