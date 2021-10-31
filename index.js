
const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kd44i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        // console.log("Successfully connected");
        const database = client.db("tourBeeTravels");
        const packagesCollection = database.collection("packages");
        const bookingsCollection = database.collection("bookings");

        // Add package
        app.post('/addPackage', async (req, res) => {
            const package = req.body;
            // console.log('Post hitted', req.body);
            const result = await packagesCollection.insertOne(package);
            res.json(result);
        })
        // Get all package
        app.get('/packages', async (req, res) => {
            const cursor = packagesCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });

        // Get single package
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('Getting specific service', id);
            const query = { _id: ObjectId(id) };
            const package = await packagesCollection.findOne(query);
            res.send(package);
        })

        // Add Bookings

        app.post('/addBookings', async (req, res) => {
            const booking = req.body;
            // console.log('Post hitted', req.body);
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        })

        //Get only My Bookings
        app.get('/myBookings/:email', async (req, res) => {
            const email = req.params.email;
            // console.log('Getting specific email', email);
            const query = { email: req.params.email };
            const myBookings = await bookingsCollection.find(query).toArray();
            res.send(myBookings);
        })

        //Delete A Booking
        app.delete("/deleteBooking/:id", async (req, res) => {
            const id = req.params.id;
            // console.log('Getting specific service', id);
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        });

        // Get All bookings (Manage Bookings)
        app.get("/allBookings", async (req, res) => {
            const result = await bookingsCollection.find({}).toArray();
            res.json(result);
        });

        // Update status of Bookings
        app.put("/allBookings/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedStatus = req.body;
            const updateDoc = {
                $set: {
                    status: updatedStatus.status
                },
            };
            const result = await bookingsCollection.updateOne(filter, updateDoc);
            // console.log(result);
            res.json(result);
        })


       
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Travel Assignment  Server');
});

app.listen(port, () => {
    console.log('Running Genius Server on port', port);
})