const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());

// DB url setting 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eogpx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // connect mongodb
        await client.connect();
        const database = client.db('ShoeZone');
        const collectionUser = database.collection('users');
        const collectionProduct = database.collection('products');
        const collectionOrder = database.collection('orders');
        const collectionReview = database.collection('reviews');

        /*----------------------
        CRUD Method Start  Here
        -----------------------*/

        //collection a new user when register
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await collectionUser.insertOne(user);
            res.json(result);
        })

        //store user when login
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const UserDoc = {
                $set: user,
            };
            const result = await collectionUser.updateOne(filter, UserDoc, options)
            // console.log('New user added: ', result);
            res.json(result)
        })

        // make admin existing user 
        app.put('/makeAdmin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const findUser = await collectionUser.find(filter).toArray();
            if (findUser) {
                const UserDoc = {
                    $set: user,
                };
                const result = await collectionUser.updateOne(filter, UserDoc);
                // console.log('Make a new admin : ', result);
                res.json(result)
            }
            res.json()
        })


        // create or insert services to database 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await collectionProduct.insertOne(product);
            res.json(result);
        });

        // get all data from server 
        app.get('/products', async (req, res) => {
            const result = await collectionProduct.find({}).toArray();
            res.send(result);
        });

        //find a single data using id
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const service = await collectionProduct.findOne(filter);
            res.send(service);
        });



        /* --------------------------
            place order part start 
        --------------------------- */
        // insert order to mongodb
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await collectionOrder.insertOne(order);
            res.json(result);
        });

        // Get all my orders 
        app.get('/orders', async (req, res) => {
            const orders = await collectionOrder.find({}).toArray();
            res.send(orders);
        });

        // get spacific login user order with metching email 
        app.get('/orders/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail };
            const myOrders = await collectionOrder.find(query).toArray();
            res.send(myOrders);
        });

        // Cancel or delete a order 
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await collectionOrder.deleteOne(query);
            res.json(result);
        });

        // get single order using id 
        /*  app.get('/manage/:id', async (req, res) => {
             const id = req.params.id;
             const query = { _id: ObjectId(id) };
             const order = await collectionOrder.findOne(query);
             console.log('Find order with id: ', id);
             res.send(order);
         }) */

        //update a single services

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateStatus = {
                $set: {
                    status: updatedOrder.status
                },
            };
            const result = await collectionOrder.updateOne(filter, updateStatus, options)
            console.log('updated Successful: ', id);
            res.json(result)
        })

        //add a new review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await collectionReview.insertOne(review);
            res.json(result);
            // console.log(result);
        });

        // get review 
        app.get('/reviews', async (req, res) => {
            const review = await collectionReview.find({}).toArray();
            res.json(review);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running ShoeZone Server Online');
});
app.listen(process.env.PORT || port, () => {
    console.log('Running ShoeZone server, port:', port);
});
