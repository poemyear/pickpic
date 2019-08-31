const db = require('../db');

// /db.connect();

exports.login = (req, res) => {
    console.log("controller.js - login");
    db.loginUser(req.body.id, req.body.password)
        .then((result) => {
            console.log("result:" + result);
            res.status(200).send(result);
        }).catch((err) => {console
        .error(err); res.status(400).send(err); });
}

