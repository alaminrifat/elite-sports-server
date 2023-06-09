const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
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

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res
            .status(401)
            .send({ error: true, message: "Unauthorized Access!!!" });
    }
    const token = authorization.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res
                .status(403)
                .send({ error: true, message: "Forbidden Access!!!" });
        }
        req.decoded = decoded;
        next();
    });
};

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
        const selectedCourseCollection = client
            .db("eliteSportsDB")
            .collection("selectedCourse");

        app.post("/jwt", async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "2h",
            });
            res.send({ token });
        });

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

        //   get approved classes
        app.get("/classes", verifyJWT, async (req, res) => {
            const classes = await classesCollection
                .find({ status: "approved" })
                .toArray();
            res.send(classes);
        });
        // get all instructos
        app.get("/instructors", async (req, res) => {
            const instructors = await instructorsCollection.find().toArray();
            res.send(instructors);
        });
        // get total count of instructors classes
        app.get("/classes/count/:instructorName", async (req, res) => {
            const instructorName = req.params.instructorName;
            const classCount = await classesCollection.countDocuments({
                instructor: instructorName,
            });
            console.log(classCount);
            res.json({ count: classCount });
        });
        //save selected class
        app.post("/classes", async (req, res) => {
            const selectedClass = req.body;
            // check already selected or not ?
            const email = selectedClass.email;
            const courseId = selectedClass.course._id;

            const existingSelection = await selectedCourseCollection.findOne({
                email: email,
                "course._id": courseId,
            });
            if (existingSelection) {
                // Email has already selected this course
                return res.send({
                    error: "This course has already been selected by the email.",
                });
            }

            // console.log(selectedClass);
            const result = await selectedCourseCollection.insertOne(
                selectedClass
            );
            res.send(result);
        });
        // get selected classes
        app.get("/selectedClasses/:email", async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const selectedClasses = await selectedCourseCollection
                .find({ email })
                .toArray();
            res.send(selectedClasses);
        });
        // get all classes
        app.get("/all-classes", async (req, res) => {
            const allClasses = await classesCollection.find().toArray();
            res.send(allClasses);
        });

        // isStudent??
        app.get("/users/student/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;

            // console.log(email);
            // if (req.decoded.email !== email) {
            //   res.send({ student: false })
            // }

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { student: user?.role === "Student" };
            res.send(result);
        });

        // isInstructor??
        app.get("/users/instructor/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;

            console.log(email);
            if (req.decoded.email !== email) {
                res.send({ instructor: false });
            }

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { instructor: user?.role === "instructor" };
            res.send(result);
        });
        // add a course
        app.post("/api/classes", async (req, res) => {
            const newClass = req.body;
            const result = await classesCollection.insertOne(newClass);
            res.send(result);
        });
        

        // for admin

        app.get("/all-users", verifyJWT, async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        });
        // update user role
        app.patch("/users/:userId", async (req, res) => {
            const userId = req.params.userId;
            const { role } = req.body;

            const result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { role } }
            );
            console.log(result);
            res.send(result);
        });
        // verify admin?
        app.get("/users/admin/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;

            console.log(email);
            if (req.decoded.email !== email) {
                res.send({ admin: false });
            }

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === "admin" };
            res.send(result);
        });
        // approve a class
        app.patch("/api/classes/:classId/approve", async (req, res) => {
            const { classId } = req.params;
            console.log(classId);
            try {
                const updatedClass = await classesCollection.updateOne(
                    { _id: new ObjectId(classId) },
                    { $set: { status: "approved" } }
                );
                res.send(updatedClass);
            } catch (error) {
                console.error("Error approving class:", error);
                res.sendStatus(500);
            }
        });
        // deny a class
        app.patch("/api/classes/:classId/deny", async (req, res) => {
            const { classId } = req.params;
            console.log(classId);
            try {
                const updatedClass = await classesCollection.updateOne(
                    { _id: new ObjectId(classId) },
                    { $set: { status: "denied" } }
                );
                res.send(updatedClass);
            } catch (error) {
                console.error("Error deny class:", error);
                res.sendStatus(500);
            }
        });
        // Add Feedback to Class
        app.post("/api/classes/:classId/feedback", async (req, res) => {
            const { classId } = req.params;
            const { feedback } = req.body;
            try {
                const updatedClass = await classesCollection.updateOne(
                    { _id: new ObjectId(classId) },
                    { $set: { feedback: feedback } }
                );
                res.send(updatedClass);
            } catch (error) {
                console.error("Error adding feedback to class:", error);
                res.sendStatus(500);
            }
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
