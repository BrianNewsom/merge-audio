exports.StartServer = StartServer

var express = require('express');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');
var fs = require('fs-extra');
var aws = require('aws-sdk');
/* REMOVEEEEEE */
aws.config.loadFromPath('./config.json');

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
app.post('/file-upload', function(req, resp) {
    // TODO: There's got to be a better way to do this....
    var s3 = new aws.S3({ params: {Bucket: 'briannewsomsongs'} });
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname,file,filename){
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
            resp.redirect('back');
        });
    });
});

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
