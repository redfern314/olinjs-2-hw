
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI||'localhost');

var catSchema = mongoose.Schema(
    {name: String,
      age: Number,
      colors: [String] 
      }
);

var Cat = mongoose.model('Cat', catSchema);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/cats/new', function(req,res){
    var poss_colors = ["white", "tan", "black", "orange", "brown"];
    var age = Math.floor((Math.random()*20)+1);
    var color1 = poss_colors[Math.floor((Math.random()*5))];
    var color2 = poss_colors[Math.floor((Math.random()*5))];
    var name = String.fromCharCode(Math.floor((Math.random()*26)+65));
    for(var x = 0; x<7; x++) {
      name = name.concat(String.fromCharCode(Math.floor((Math.random()*26)+97)));
    }
    var kitty = new Cat({ name: name, age: age, colors: [color1,color2]});
    kitty.save(function (err) {
      if (err) console.log(err); // ...
      res.send("created new cat");
    });
});

app.get('/cats/delete/old', function(req, res) {
    Cat.find({}, 'age', {sort: {age: -1}}, function(err, docs) {
        if (err) console.log(err); // ...
        Cat.remove({_id: docs[0]._id}, function(err) {
            if (err) console.log(err); // ...
            res.send("cat passed away :(");
        }
    )})
})

app.get('/cats/color/:color', function(req, res) {
    Cat.find({'colors': req.params.color}, 'age name colors', {sort: {age: -1}}, function(err, docs) {
        if (err) console.log(err); // ...
        res.render('cats', { title: req.params.color.concat(' cats'), cats: docs });
    })
})

app.get('/cats', function(req, res) {
    Cat.find({}, 'age name colors', {sort: {age: -1}}, function(err, docs) {
        if (err) console.log(err); // ...
        res.render('cats', { title: 'all cats', cats: docs });
    })
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
