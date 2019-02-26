#!/usr/bin/env node
//Noah Mansfield
//web server to register for a contest
//accepts get and post commands
//listening on port 3000
let express = require("express");
var bodyParser = require("body-parser");
let mysql = require("mysql");
let pool = mysql.createPool({    
    "host": "localhost",
    "user": "ubuntu",
    "password": "password",
    "database": "contest",
    "connectionLimit": 10
});


let app = express();
app.use(bodyParser.urlencoded({extended:false}));
//query the database for all contestents
app.get('/registrations', function (req, res) {

    pool.getConnection(function(err, connection) {
        if (err) {
            res.send("Problem: " + err);
            return;
        }
        connection.query("SELECT * FROM contest", function (err, results) {
            res.send(JSON.stringify(results));
            connection.release();  // release connection
        });
    });
});
//validat string. string < 50
//returns 1 if string does not pass
//zero otherwise
let valstr = function(s)
{
    if(s.length > 50 || s.length < 1)
        return 1;
    else
        return 0;
}
//returns 1 if size is not one of the avalible options
//zero otherwise
let valsize = function(c)
{
    
    if(c== 'S' || c == 'M' || c == 'L' || c == 'l' || c == 's' || c == 'm')
        return 0;
    else
        return 1;
}
//validates an integer
//return 1 if not 9,10,or 11
//zero otherwise
let valint = function(i){
    if(i != 9 && i != 10 && i != 11 && i!=12)
    {
        return 1;
    } 
    else{
        return 0;
    }
};
//object to handle validation
let valid = {
"firstname":valstr,
"lastname":valstr,
"grade":valint,
"email":valstr,
"shirtsize":valsize,
"hrusername":valstr
};
//returns an error string if params does not pass all the tests
//zero otherwise
validateparams = function(params)
{
    let rc = 0;
    let k = Object.keys(valid);
    let i = 0;
// loop through keys in valid object
    while(i < k.length){    
        let key = k[i]; //makes the code cleaner
        if(params[key]) //if key form valid in params object
        {
	    //attempt to validate param
            if (valid[key](params[key]) != 0){
                console.log("invalid on key:"+key);
                return key+" is invalid";
            }
        }
        else //param[key] is undefined
        {
            console.log(key+" is undefinded. All values must be included");
            return key+" is undefinded. All values must be included";
        }
        i++;
    }
    
 
    return rc;

}
//inserts a new record into database
app.post('/registrations', function (req, res) {
    
    let data = req.body;
    let rc = validateparams(req.body);
    if(rc == 0)
    {
        let sql = "INSERT INTO contest(firstName, lastName, grade, email,shirtSize, hrUsername) VALUES(?, ?, ?, ?, ?, ?)";
        pool.getConnection(function(err,connection){
            if(err)
            {
		if(err["sqlMessage"].search("Duplicate entry") != -1){
			console.log("Problem: Duplicate entry");
		}
		else{
                console.log("Problem: "+ err);
		}
                return;
            };
            sql = mysql.format(sql, [data.firstname, data.lastname,data.grade,data.email,data.shirtsize,data.hrusername]);
            connection.query(sql, function(err, results){
               	connection.release();
		if(err)
                {
                    console.log(err);
                    res.status(500);
                    res.send(err.sqlMessage);
                    return;
                }
                res.sendStatus(200);
            });
        });
    }
    else
    {
        res.status(400);
        res.send("Validation Error: "+rc+"\n");
    }
});
let port =3000;
app.listen(port, function () {
    console.log('Express server listening on port ' + port);
});
