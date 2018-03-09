var express = require('express')
var watson = require('./watson')
var fs = require('fs');
var app = express()

function makeid() {
    var text = "audio";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text + '.wav';
}

app.get('/', function (req, res) {
    res.send(`
    <div>
    <h1>Hello</h1>
</div>
<div>How are you doing ?</div>

<div>
    <input id="input" type="text" placeholder="Ask..." name="Ask">
</div>
<divsp>
    <button type="submit" onclick="Clear()">Submit

    </button>

</divsp>

<div id="appendBox">
</div>
<div id="audioBox">

</div>

<script>
    function Clear() {

        var text = document.getElementById("input").value
        var textnode = document.createTextNode(text)
        document.getElementById("appendBox").appendChild(textnode)
        document.getElementById("appendBox").appendChild(document.createElement("br"))

        document.getElementById("input").value = "";

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('this: ',this);
                var audioTag = \`<audio controls>
                <source src= "https://s3-us-west-2.amazonaws.com/enkibot/tim_web/\`+this.response+\`" type="audio/wav">
                Your browser does not support the audio tag.
              </audio> \`
                document.getElementById('audioBox').innerHTML = audioTag          
            }
        };
        xhttp.open("GET", "http://localhost:3000/audio?text=" +text , true);
        console.log('url: ', "localhost:3000/audio?text=" +text);
        xhttp.send();
    }
</script>

    `)
})

app.get('/audio', function (req, res) {
    var randomi = makeid()
    console.log('req: ', req.query.text);
    watson.t2s(req.query.text, randomi, function (err, ok) {
        if (err) {
            console.log('err: ', err);
            res.status(500).send(err)
        } else
            res.send(randomi).status(200)
    })
})

app.listen(3000)
