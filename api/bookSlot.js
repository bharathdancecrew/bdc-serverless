const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    const { slotId, userId } = req.body;  // Receive slot ID and user ID from the request

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const slotsCollection = database.collection("slots");

        const slot = await slotsCollection.findOne({ _id: new ObjectId(slotId) });

        if (!slot) {
            res.status(404).send({ message: 'Slot not found' });
            return;
        }

        if (slot.currentReservations >= slot.maxReservations) {
            res.status(400).send({ message: 'No more spots available' });
            return;
        }

        const updatedSlot = await slotsCollection.updateOne(
            { _id: new ObjectId(slotId) },
            { $inc: { currentReservations: 1 }, $push: { bookedBy: userId } }
        );

        res.status(200).send({ message: 'Slot booked successfully', updatedSlot });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
