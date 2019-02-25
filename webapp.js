

let express = require("express");
var bodyParser = require("body-parser");
let mysql = require("mysql");
let pool = mysql.createPool({    
    "host": "localhost",
    "user": "ubuntu",
    "password": "",
    "database": "contest",
    "connectionLimit": 10
});


let app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.get('/reg', function (req, res) {

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
let valstr = function(s)
{
    if(s.length > 50 || s.length < 1)
        return 1;
    else
        return 0;
}
let valsize = function(c)
{
    
    if(c== 'S' || c == 'M' || c == 'L' || c == 'l' || c == 's' || c == 'm')
        return 0;
    else
        return 1;
}
let valint = function(i){
    if(i != 9 && i != 10 && i != 11 && i!=12)
    {
        return 1;
    } 
    else{
        return 0;
    }
};
let valid = {
"firstname":valstr,
"lastname":valstr,
"grade":valint,
"email":valstr,
"shirtsize":valsize,
"hrusername":valstr
};
validateparams = function(params)
{
    let rc = 0;
    let k = Object.keys(valid);
    let i = 0;
    while(i < k.length){    
        let key = k[i];
        if(params[key])
        {
            if (valid[key](params[key]) != 0){
                console.log("invalid on key:"+key);
                return key+" is invalid";
            }
        }
        else
        {
            console.log(key);
            console.log(params[key]);
            return key+" is undefinded. All values must be included";
        }
        i++;
    }
    
 
    console.log('rc');
    return rc;

}

app.post('/reg', function (req, res) {
   
    let data = req.body;
    let rc = validateparams(req.body);
    if(rc == 0)
    {
        let sql = "INSERT INTO contest(firstName, lastName, grade, email,shirtSize, hrUsername) VALUES(?, ?, ?, ?, ?, ?)";
        pool.getConnection(function(err,connection){
            if(err)
            {
                console.log("Problem: "+ err);
                return;
            };
            sql = mysql.format(sql, [data.firstname, data.lastname,data.grade,data.email,data.shirtsize,data.hrusername]);
            connection.query(sql, function(err, results){
                if(err)
                {
                    console.log(err);
                    res.status(500);
                    res.send(err);
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
let port =2000;
app.listen(port, function () {
    console.log('Express server listening on port ' + port);
});