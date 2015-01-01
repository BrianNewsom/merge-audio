exports.StartServer = StartServer

var express = require('express');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');
var fs = require('fs-extra');
var aws = require('aws-sdk');
var Parse = require('parse').Parse;
/* REMOVEEEEEE */
aws.config.loadFromPath('./config.json');
Parse.initialize("s4ZaCLGhg6RCEoQvnxLgQ6Pks1jaIHwEcEH4vC4y", "BhMJzuLaOFee060SkjVohAA7hWCh0Z9geG7Cs2wl");

var app = express();

function StartServer() {

	app.set('port', (process.env.PORT || 5000));
	app.use(express.static(__dirname + '/'))
	app.use(bodyParser.json())
    app.use(busboy());

	app.listen(app.get('port'), function() {
	  console.log("Charity server is running at localhost:" + app.get('port'))
	})

}

StartServer()

// Receive notifications for organization wallet
app.post('/file-upload', function(req, resp, next) {
    // TODO: There's got to be a better way to do this....
    var s3 = new aws.S3({ params: {Bucket: 'briannewsomsongs'} });
    var fstream;
    var outObj = {};
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname,file,filename){
        outObj['filename'] = filename.replace(' ','+');
        var filePath = __dirname + '/audio/' + filename;
        fstream = fs.createWriteStream(filePath);
        file.pipe(fstream);
        fstream.on('close',function(){
            var readStream = fs.createReadStream(filePath);
            readStream.on('open', function() {
                s3.putObject({'Bucket':'briannewsomsongs','Key':filename,'Body': readStream},function(err, data){
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('successfully uploaded to s3');
                        // Upload worked, we can delete on server.
                        fs.unlink(filePath)
                    }
                })
            })
        });
    });
    req.busboy.on('field', function(fieldname,val){
        if (req.body.hasOwnProperty(fieldname)) {
            if (Array.isArray(req.body[fieldname])) {
                req.body[fieldname].push(val);
            } else {
                req.body[fieldname] = [req.body[fieldname], val];
            }
        } else {
            req.body[fieldname] = val;
        }
    });

    req.busboy.on('finish', function(){
        outObj['name'] = req.body.stemName;
        parseStore('Stem',outObj, function(id){
            // Store stem object in parse
            var Track = Parse.Object.extend('Track');
            var query = new Parse.Query(Track);
            query.equalTo("name", req.body.track)
            createTrack(req.body.track,'unknown', [id], function(existingTrack){
                var stems = existingTrack.get('stems');
                stems.push(id);
                existingTrack.set('stems',stems);
                existingTrack.save();
            });
        });
        resp.json(outObj);
    });
});

function createTrack(name, author, stems, callback){
    // callback occurs when track exists
    var Track = Parse.Object.extend('Track');
    var query = new Parse.Query(Track);
    query.equalTo("name", name)
    query.first({
        success: function(object){
            if (object == undefined){
                // No matching track found - create track
                var newTrack = {};
                newTrack['name'] = name;
                newTrack['author'] = author;
                newTrack['stems'] = stems;
                parseStore('Track',newTrack, function(id) { console.log('new track stored');});
            } else {
                // Track exists, handle.
                console.log('Track exists');
                callback(object);
            }
        },
        error: function(err){
            console.log(err);
        }
    });

}
function parseStore(type,_obj, callback){
    var Obj = Parse.Object.extend(type);
    var obj = new Obj();
    obj.save(_obj, {
        success: function(obj){
            console.log(obj['id']);
        },
        error: function(obj, err){
            console.log(err);
        }
    }).then(function() {
        callback(obj['id']);
    });

}

// Simple view engine
app.set('views', __dirname);
app.engine('html',require('ejs').renderFile);
app.set('view engine','ejs');

app.get('/addstem',function(req,res){
    res.render('addstem.html');
});

app.get('/mixer',function(req,res){
    res.render('mixer.html');
});

app.get('/getTracks/:max', function(req, res){
    parseGet('Track', req.param("max"), function(tracks){
        res.send(tracks);
    });
});

function parseGet(type, max, callback){
    var query = new Parse.Query(type);
    query.limit(max);
    var all = [];
    query.find({
        success: function(results){
            for (var i = 0 ; i < results.length ; i++){
                all.push(results[i]);
            }
        },
        error: function(err){
            console.log(err);
        }
    }).then( function(){
        callback(all);
    });
}
