const { MongoClient } = require('mongodb');

// MongoDB URI and client setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    try {
        await client.connect();
        const database = client.db("bdcusers"); // Use your specific database name
        const slotsCollection = database.collection("slots");

        // Fetch all slots data
        const slots = await slotsCollection.find({}).toArray();

        res.status(200).json({ slots });
    } catch (e) {
        console.error("Error accessing database:", e);
        res.status(500).json({ error: e.message });
    } finally {
        await client.close();
    }
};
