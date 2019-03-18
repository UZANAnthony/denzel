const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = "mongodb+srv://admin:PASS@denzel-cluster-my1ng.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "denzel";

const imdb = require('./src/imdb');

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

var database, collection;

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

app.get("/movies", async (Request, response) => {
    await collection.aggregate([
            {$match: {metascore: {$gte: 70}}},
            {$sample: {size: 1}}
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

