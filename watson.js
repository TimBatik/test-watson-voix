require('dotenv').config()
var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var AWS = require('aws-sdk')

var s3 = new AWS.S3();

var fs = require('fs');

var textToSpeech = new TextToSpeechV1({
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    url: 'https://stream.watsonplatform.net/text-to-speech/api/'
});

var params = {
    text: 'Hello from IBM Watson',
    voice: 'de-DE_BirgitVoice', // Optional voice
    accept: 'audio/wav'
};

// Synthesize speech, correct the wav header, then save to disk
// (wav header requires a file length, but this is unknown until after the header is already generated and sent)
textToSpeech
    .synthesize(params, function (err, audio) {
        if (err) {
            console.log(err);
            return;
        }
        textToSpeech.repairWavHeader(audio);
        fs.writeFileSync('audio.wav', audio);
        console.log('audio.wav written with a corrected wav header');
    });

module.exports.t2s = function (text, randomi, callback) {

    var params = {
        text,
        voice: 'en-GB_KateVoice', // Optional voice
        accept: 'audio/wav'
    };

    textToSpeech
        .synthesize(params, function (err, audio) {
            console.log('err, audio: ', err, audio);
            if (err) {
                console.log(err);
                return;
            }

            textToSpeech.repairWavHeader(audio);
            var params = {
                ACL: "public-read",
                Body: audio,
                Bucket: "enkibot/tim_web",
                Key: randomi
            };

            s3.putObject(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else console.log(data); // successful response
                callback(err, data)
                /*
                data = {
                 ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
                 ServerSideEncryption: "AES256", 
                 VersionId: "Ri.vC6qVlA4dEnjgRV4ZHsHoFIjqEMNt"
                }
                */
            })
            //fs.writeFileSync('audio.wav', audio);
        });

}
