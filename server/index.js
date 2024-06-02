const { Long, Int32 } = require('mongodb')
const mongoose = require('mongoose')
const { Schema } = mongoose
main().catch((err) => console.log(err))
console.log('aaaa')
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/mpadmin')
  const CounterSchema = mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
  })
  const Counter = mongoose.model('counter', CounterSchema, 'counter')
  // const res = await Counter.find()
  const counter = await Counter.findOneAndUpdate({ _id: 'user' }, { $inc: { seq: 1 } }, { new: true, upset: true })
  if (counter) console.log(counter.seq)
}

// Connect the client to the server	(optional starting in v4.7)

//   const collection = db.collection('UserPermission')
//   // await client.db('permission').command({ ping: 1 })
//   // Send a ping to confirm a successful connection
//   const longValue = BigInt('9223372036854775807')
//   const sequence = await db.collection('counter').findOneAndUpdate({ _id: 'sequence_name' }, { $inc: { value: 1 } })
//   const bbb = await collection.findOneAndUpdate(
//     { uid: { $exists: false } },
//     { $inc: { uid: 1 }, $set: { p1: longValue } },
//     {
//       returnOriginal: false,
//       upsert: true
//     }
//   )
//   console.log(bbb)
//   const aaa = await collection.findOne({ uid: 1, p1: { $bitsAllSet: [1] } })
//   const val = BigInt(aaa.p1)
//   console.log('result', val)
//   console.log(aaa)
// } finally {
// Ensures that the client will close when you finish/error
// await client.close()
// }
