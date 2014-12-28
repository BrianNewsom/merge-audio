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
            query.first({
                success: function(object){
                    if (object == undefined){
                        // No matching track found - create track w/ only thisstem
                        var newTrack = {};
                        newTrack['name'] = req.body.track;
                        newTrack['author'] = 'unknown';
                        newTrack['stems'] = [id];
                        parseStore('Track',newTrack, function(id) { console.log('new track stored');});
                    } else {
                        // If we find a matching track, append this stem.
                        var stems = object.get('stems');
                        stems.push(id);
                        object.set('stems',stems);
                        object.save();
                    }
                },
                error: function(err){
                    console.log(err);
                }
            });
        });
        resp.json(outObj);
    });
});

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

app.get('/getAllTracks', function(req, res){
    parseGetAll('Track', function(allTracks){
        res.send(allTracks);
    });
});

function parseGetAll(type, callback){
    var query = new Parse.Query(type);
    var all = [];
    query.find({
        success: function(results){
            for (var i = 0 ; i < results.length ; i++){
                all.push(results[i].get('name'));
            }
        },
        error: function(err){
            console.log(err);
        }
    }).then( function(){
        callback(all);
    });
}
/*
app.get('/sign_s3', function(req, res){
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.s3_object_name,
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.s3_object_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});
*/
