const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Origin",
        "X-Requested-With",
        "Accept",
        "x-client-key",
        "x-client-token",
        "x-client-secret",
        "Authorization",
    ],
    credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhaictv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //  client.connect();
        const usersCollection = client.db("eliteSportsDB").collection("users");
        const classesCollection = client
            .db("eliteSportsDB")
            .collection("classes");
        const instructorsCollection = client
            .db("eliteSportsDB")
            .collection("instructors");

        // store an user to the database
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            console.log(user);
            if (existingUser) {
                return res.send({ message: "User already exists!" });
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Elite Sports Academy Server is Running...");
});

app.listen(port, () => {
    console.log(`Elite Sports Academy Server Running on PORT:  ${port}`);
});
