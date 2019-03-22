const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');

const CONNECTION_URL = "mongodb+srv://admin:PASS@denzel-cluster-my1ng.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "denzel";

const imdb = require('./src/imdb');

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

var database, collection;




var schema = buildSchema(`
    type Query {
      movie: Movie
    }
    type Movie {
      link: String
      metascore: Int
      synopsis: String
      title: String
      year: Int
    }
`);
var root = {
    movie: async function (){
        var movie = await collection.aggregate([
            {$match: {metascore: {$gte: 70}}},
            {$sample: {size: 1}}
        ]).toArray()
        return movie[0]
    }
};

app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));


app.listen(3000, () => {
    MongoClient.connect(CONNECTION_URL, {useNewUrlParser: true}, (error, client) => {
        if(error){
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.get("/movies/populate", async (Request, response) => {
    var arr = await imdb("nm0000243");
    await collection.insertMany(arr, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send({total: arr.length});
    });
});

app.get("/movies/search", async (Request, response) => {
    var par1 = Request.query.limit;
    var par2 = Request.query.metascore;
    await collection.aggregate([
            {$match: {metascore: {$gte: Number(par2)}}},
            {$sort: {metascore: -1}},
            {$limit: Number(par1)}
        ]).toArray(function(err, docs){
        response.send(docs);
    });
});

app.get("/movies/:id", async (request, response) => {
    collection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/movies", async (Request, response) => {
    await collection.aggregate([
            {$match: {metascore: {$gte: 70}}},
            {$sample: {size: 1}}
        ]).toArray(function(err, docs){
        response.send(docs);
    });
});

app.post("/movies/:id", async (request, response) => {
    const update = {
        "$set": 
        {
            "date": request.body.date,
            "review": request.body.review
        }
    };
    const options = { "upsert": false };

    await collection.findOne({ "id": request.params.id }, async (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        await collection.updateOne(result, update, options)
        .then(result => {
            const { matchedCount, modifiedCount } = result;
            if(matchedCount && modifiedCount) {
                console.log(`Successfully added a new review.`);
            }
        })
        .catch(err => console.error(`Failed to add review: ${err}`))
        response.send({_id: result._id});
    });
});

