const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { slotId } = req.query; // Assuming slotId is passed as a query parameter

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const slotsCollection = database.collection("slots");

        const result = await slotsCollection.deleteOne({ _id: new ObjectId(slotId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Slot deleted successfully' });
        } else {
            res.status(404).json({ message: 'Slot not found' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Failed to delete slot', error: e.message });
    } finally {
        await client.close();
    }
};
