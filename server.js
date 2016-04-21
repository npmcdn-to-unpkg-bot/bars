var express = require("express"),
    app = express(),
    session = require("express-session"),
    dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/data",
    mongoose = require("mongoose"),
    MongoStore = require("connect-mongo")(session),
    User = require("./app/models/user.js"),
    Bar = require("./app/models/bar.js"),
    port = process.env.PORT,
    yelpAuth = require("./config/yelpAuth.js"),
    passport = require("passport"),
    Yelp = require("yelp");

require("./config/passport")(passport);
mongoose.connect(dbUrl);
app.use(session({
    secret: "barSecret",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({mongooseConnection: mongoose.connection,
        ttl: 2 * 24 * 60 * 60
    })
}));
app.use(passport.initialize());
app.use(passport.session());

var yelp = new Yelp({
    consumer_key: yelpAuth.consumer_key,
    consumer_secret: yelpAuth.consumer_secret,
    token: yelpAuth.token,
    token_secret: yelpAuth.token_secret,
});

//VIEWS
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");

//ROUTES
var auth = express.Router();
require("./app/routes/auth.js")(auth, passport)
app.use("/auth", auth);

app.get("/search", function (req,res){
    yelp.search({
        term: 'bars',
        location: req.query.location
    })
    .then(function(data) {
        var ids = [],
        checkInCount = {};
        for (var i in data.businesses){
            ids.push(data.businesses[i].id)
        }
         Bar.find({ id: { $in: ids}}).then(function (bars) {
             for (var b in bars)
                 checkInCount[bars[b].id]= bars[b].checkIns;
            data.checkInCount = checkInCount;
            if (req.user)
            data.user = req.user;
            else
            data.user= false;
            res.render("searchResults.ejs",data);
        })
    })
    .catch(function(err) {
        console.log(err);
        res.send(JSON.parse(err.data).error.text+"<br><a href='/'>Go Home</a>");
    });
})

app.get("/checkin/:id", function(req,res){
    if (req.user){
      User.update({facebookId: req.user.facebookId}, {$push: {checkIns: {$each: [req.params.id]}}}, {upsert:true}, function(err){
        if(err) throw err;
        Bar.count({id: req.params.id}).then(function(c){
            if (c>0){
            Bar.update({id: req.params.id}, {$inc:{checkIns: 1}}, function (err){
                if (err) throw err;
                res.redirect(req.header('Referer') || '/');
            })  
        }
        else{
            var newBar = new Bar();
            newBar.id = req.params.id;
            newBar.checkIns = 1;
            newBar.save().then(function(){
               res.redirect(req.header('Referer') || '/'); 
            })
        }
        })        
    });
     }
     else{
         req.session.returnTo =req.header('Referer') || '/'; 
         res.render("login.ejs");
     }
})

app.get("/checkout/:id", function (req,res){
       if (req.user){
        User.update( {facebookId: req.user.facebookId}, { $pullAll: {checkIns: [req.params.id] } }, function (err){ 
            if(err) throw err;
            Bar.update({id: req.params.id}, {$inc :{checkIns: -1}}, function (err){
          if (err) throw err;
          res.redirect(req.header('Referer') || '/');
        })
        });
     }
     else{
         req.session.returnTo =req.header('Referer') || '/';
         res.render("login.ejs");
     }
    
})

app.get("/*", function (req, res){
    res.render("index.ejs", {user:req.user})
})

app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on " + port);

})
