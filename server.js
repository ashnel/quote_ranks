var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var path = require('path');
const querystring = require('querystring');

app.use(express.static( __dirname + '/quotes/dist' ));
app.use(express.static(path.join(__dirname, './static')));

var mongoose = require('mongoose');

app.get('/', function(req, res) {
})

app.put('/upvote/:id', function(req, res) {
    var quote = req.body;

    Author.findById(req.params.id).then(author => {
        let quote = author.quotes.id(req.body._id);
        quote.votes += 1;
        return author.save();
    });
})

app.put('/delete_quote/:id', function(req, res) {
    Author.update({ _id: req.params.id }, { "$pull": { "quotes": { "_id": req.body._id } }}, { safe: true, multi:true }, function(err, obj) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('done', obj);
        }
    });
})

app.put('/downvote/:id', function(req, res) {
    var quote = req.body;

    Author.findById(req.params.id).then(author => {
        let quote = author.quotes.id(req.body._id);
        quote.votes -= 1;
        return author.save();
    });
})

app.put('/add_quote/:id', function(req, res) {
    console.log('add quote', req.body);
    var quote = {quote: req.body.quote};

    if (req.body.quote.length < 3) {
        res.json({message: 'bad'});
        return false;
    }

    Author.findOne({_id: req.params.id}, function (err, author) {
        if (err) {
            console.log('error');
        }
        else {
            author.quotes.push({
                quote: req.body.quote,
                votes: 0
            })

            author.save(function(err) {
                if (err) {
                    console.log('bad');
                    res.json({message: 'bad'});
                }
                else {
                    console.log('good');
                    res.json({message: 'good'});
                    console.log(author.quotes);
                }
            })
        }
    })
})

app.put('/update/:id', function(req, res) {
    if (req.body.name.length < 3) {
        res.json({message: 'bad'});
        return false;
    }
    else {
        Author.update({_id: req.params.id}, {name: req.body.name}, function (err) {
            if (err) {
                console.log("Author could not be updated; please try again.");
                res.json({message: 'bad'});
            }
            else {
                console.log("Author updated!");
                res.json({message: 'good'});
            }
        })
    }
})

app.delete('/delete/:id', function(req, res) {
    Author.remove({_id: req.params.id}, function (err) {
        if (err) {
            console.log("There was an error; author not deleted.");
        }
        else {
            console.log("Author was deleted!");
        }
    })
})

app.get('/author/:id', function(req, res) {
    Author.find({_id: req.params.id}, function (err, author) {
        if (err) {
            res.json({message: "error", error: err});
            console.log(err);
        }
        else {
            res.json({message: "Success", data: author});
            // console.log({message: "Success", data: authors})
        }
    })
})

app.get('/authors', function(req, res) {
    Author.find({}, function (err, authors) {
        if (err) {
            res.json({message: "error", error: err});
            console.log(err);
        }
        else {
            res.json({message: "Success", data: authors});
        }
    })
})

app.post('/add', function(req, res) {
    var author = new Author({name: req.body.name});

    author.save(function(err) {
        if (err) {
            console.log("There was an error; author not saved.");
            res.json({message: 'bad'});
        }
        else {
            console.log("A new author was added!");
            res.json({message: 'good'});
        }
    })
})

app.all("*", (req,res,next) => {
    res.sendFile(path.resolve("./public/dist/index.html"))
  });

app.listen(8000, function() {
    console.log("listening on port 8000");
})

mongoose.connect('mongodb://localhost/authors');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var AuthorSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    quotes: [{
        quote: {type: String},
        votes: {type: Number}
    }],
    quote: [{
        quote: {type: String, required: true, minlength: 3},
        votes: {type: Number, default: 0}
    }]
}, {timestamps: true });

mongoose.model('Author', AuthorSchema); // We are setting this Schema in our Models as 'Author'
var Author = mongoose.model('Author');