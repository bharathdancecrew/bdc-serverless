const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { slotId, userId } = req.body;

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const slotsCollection = database.collection("slots");

        const slot = await slotsCollection.findOne({ _id: new ObjectId(slotId) });

        if (!slot) {
            res.status(404).send({ message: 'Slot not found' });
            return;
        }

        // Check if the user is actually booked for this slot
        if (!slot.bookedBy.includes(userId)) {
            res.status(400).send({ message: 'User has not booked this slot' });
            return;
        }

        // Update the slot by removing the user ID from the bookedBy array
        const updatedSlot = await slotsCollection.updateOne(
            { _id: new ObjectId(slotId) },
            { $pull: { bookedBy: userId }, $inc: { currentReservations: -1 } }
        );

        if (updatedSlot.modifiedCount === 1) {
            res.status(200).send({ message: 'Slot cancellation successful' });
        } else {
            throw new Error("Slot cancellation failed");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
