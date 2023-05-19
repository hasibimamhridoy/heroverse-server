const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@heroverse.ivmrioe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productsCollection = client.db('heroVerse').collection('products')
        const topRatedCollection = client.db('heroVerse').collection('topRated')
        const newArrivalsCollection = client.db('heroVerse').collection('newArrivals')

        //its e indexing search
        const indexKey = { title: 1, category: 1 }
        const indexOptions = { name: "titleSearch" }
        const searchResult = await productsCollection.createIndex(indexKey, indexOptions);
        app.get('/searchPoduct/:name', async (req, res) => {
            const name = req.params.name
            const result = await productsCollection.find({
                $or: [
                    { name: { $regex: name, $options: "i" } },
                    { sub_category: { $regex: name, $options: "i" } }
                ]
            }).toArray()
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const id = req.query.cateId
            const query = { category_id: id }

            if (req.query.cateId) {
                const result = await productsCollection.find(query).toArray()
                return res.send(result);
            }

            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)
            const skip = (page * limit)
            if (req.query.page) {
                const result = await productsCollection.find().skip(skip).limit(limit).toArray()
                return res.send(result);
            }

            const result = await productsCollection.find().toArray()
            return res.send(result);
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            return res.send(result);
        })


        app.get('/myAddedProducts', async (req, res) => {
            const email = req.query.email
            const query = { seller_email: email }
            const sortValue = req.query.sortValue
            console.log(sortValue);

            if (req.query.email) {
                const result = await productsCollection.find(query).sort({price: sortValue}).toArray()
                return res.send(result);
            }

            const result = await productsCollection.find().sort({price: sortValue}).toArray()
            return res.send(result);
        })



        app.get('/productsDetails/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query)
            res.send(result);
        })

        app.post('/products', async (req, res) => {


            const newProduct = req.body
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)

        })

        app.put('/products/update/:id', async (req, res) => {

            const id = req.params.id;
            console.log(id);
            const updateProduct = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateSetFunc = {
                $set: {

                    name: updateProduct.name,
                    picture: updateProduct.picture,
                    sub_category: updateProduct.sub_category,
                    price: updateProduct.price,
                    rating: updateProduct.rating,
                    quantity: updateProduct.quantity,
                    description: updateProduct.description
                }
            }
            const result = await productsCollection.updateOne(query, updateSetFunc, options)
            res.send(result)

        })


        //top rated

        app.get('/topRated', async (req, res) => {
            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)
            const skip = (page * limit)
            console.log(page, limit, skip);
            const result = await topRatedCollection.find().skip(skip).limit(limit).toArray()
            return res.send(result);


        })

        // app.get('/products/productPagination', async (req, res) => {
        //     const page = parseInt(req.query.page)
        //     const limit = parseInt(req.query.limit)
        //     const skip = (page * limit)
        //     console.log(page, limit, skip);
        //     const result = await productsCollection.find().skip(skip).limit(limit).toArray()
        //     return res.send(result);


        // })

        app.get('/topRatedCount', async (req, res) => {
            
            const totalRatedItem = await topRatedCollection.countDocuments()
            return res.send({totalRatedItem});


        })
        app.get('/products/totalProducts', async (req, res) => {
            
            const totalRatedItem = await productsCollection.countDocuments()
            return res.send({totalRatedItem});


        })

        //newArrivals

        app.get('/newArrivals', async (req, res) => {
            
            const result = await newArrivalsCollection.find().toArray()
            return res.send(result);
        })

        app.get('/newArrivals/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await newArrivalsCollection.findOne(query)
            res.send(result);
        })





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send(`The server is running.The port is: ${port}`);
})
app.listen(port, () => {
    console.log(`The server is running.The port is: ${port}`);
})