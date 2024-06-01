const { MongoClient, ServerApiVersion } = require('mongodb')
const uri = 'mongodb://127.0.0.1:27017'
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()
    const db = client.db('mpadmin')
    const collection = db.collection('UserPermission')
    // await client.db('permission').command({ ping: 1 })
    // Send a ping to confirm a successful connection
    const aaa = await collection.findOne({ uid: 1, p1: { $bitsAllSet: [1] } })
    console.log('aaa', aaa)
    // console.log(aaa)
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
}
run().catch(console.dir)
