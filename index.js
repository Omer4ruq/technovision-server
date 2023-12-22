const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.npoax.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    // await client.db("admin").command({ ping: 1 });
    const tasksCollection = client.db("technovisionDB").collection("tasks");
    const userCollection = client.db("technovisionDB").collection("users");
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // tasks
    app.post("/addtasks", async (req, res) => {
      const newArticle = req.body;
      console.log(newArticle);
      const result = await tasksCollection.insertOne(newArticle);
      res.send(result);
    });
    app.get("/my-tasks", async (req, res) => {
      console.log(req.query.email);
      // if (req.email.email !== req.query.email) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await tasksCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      // console.log("query" + query);
      // const result = await productCollection.findOne(query);
      const result = await tasksCollection.deleteOne(query);
      console.log(result);
      res.send(result);
      // product details
    });

    app.patch("/tasks/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: item.status,
        },
      };

      const result = await tasksCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // users
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("user", user);
      const existingUser = await userCollection.findOne({ email: user.email });
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
      // res.send({ message: "post users api called" });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
