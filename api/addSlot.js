const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const slotsCollection = database.collection("slots");

        const { from, to } = req.body;
        const newSlot = { from, to, currentReservations: 0, maxReservations: 10 };

        const result = await slotsCollection.insertOne(newSlot);
        res.status(201).json(result.ops[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error adding slot", error: e.message });
    } finally {
        await client.close();
    }
};
