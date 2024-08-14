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
        if (result.insertedId) {
            // Fetch the newly inserted document if necessary
            const insertedDocument = await slotsCollection.findOne({ _id: result.insertedId });
            res.status(201).json(insertedDocument);
        } else {
            throw new Error("Failed to insert new slot.");
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error adding slot", error: e.message });
    } finally {
        await client.close();
    }
};
