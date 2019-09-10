import * as admin from "firebase";

var registrationToken = 'YOUR_REGISTRATION_TOKEN';

var message = {
    data: {
        score: '850',
        time: '2:45'
    },
    token: registrationToken
};

admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });
// Multicast
/*
const registrationTokens = [
    'YOUR_REGISTRATION_TOKEN_1',
    // …
    'YOUR_REGISTRATION_TOKEN_N',
];

const message = {
    data: {score: '850', time: '2:45'},
    tokens: registrationTokens,
}

admin.messaging().sendMulticast(message)
    .then((response) => {
        console.log(response.successCount + ' messages were sent successfully');*/
