const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    const { date } = req.query; // Expecting date in "YYYY-MM-DD" format

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const slotsCollection = database.collection("slots");

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Log the start and end dates to ensure they're correct
        console.log("Fetching slots from:", startDate, "to", endDate);

        const slots = await slotsCollection.find({
            from: { $gte: startDate, $lt: endDate }
        }).toArray();

        if (slots.length === 0) {
            console.log("No slots found for the given date range.");
        }

        res.status(200).json({ slots });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Failed to fetch slots', error: e.message });
    } finally {
        await client.close();
    }
};
