const db = require('../db');
const fetch = require("node-fetch");

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

exports.naverLogin = async (req, res) => {
    const makeState = (length) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    console.log("controoler.js - naverLogin");

    const CLIENT_ID = "SNkG235sZSCBwLQ_4qme";
    const STATE_STRING = makeState(32);
    //const CALLBACK_URL = "http://localhost:3000/NaverLogin";
    const CALLBACK_URL = "http%3A%2F%2Flocalhost%3A3000%2FNaverLogin";
    //const CALLBACK_URL= '';
    const requestURL = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id='+CLIENT_ID+'&state='+STATE_STRING+'&redirect_uri='+CALLBACK_URL;
    var response = await fetch(requestURL);
    console.log(response.url);
    if( response && response.url )
        res.status(201).json({url:response.url});
    else
        res.status(400).send();
}

