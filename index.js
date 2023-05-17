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


    app.get('/products',async (req,res)=>{
        const id = req.query.cateId
        const query = {category_id: id}

        if (req.query.cateId) {
        const result = await productsCollection.find(query).toArray()
        return res.send(result);
        }
        const result = await productsCollection.find().toArray()
        return res.send(result);
    })
    app.get('/productsDetails/:id',async (req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await productsCollection.findOne(query)
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



app.get('/',(req,res)=>{
    res.send(`The server is running.The port is: ${port}`);
})
app.listen(port,()=>{
    console.log(`The server is running.The port is: ${port}`);
})