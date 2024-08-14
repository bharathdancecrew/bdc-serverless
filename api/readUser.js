const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    const userId = req.query.id; // Assume id is passed as query parameter
    try {
        await client.connect();
        const database = client.db("bdcusers");
        const users = database.collection("users");

        const user = await users.findOne({ _id: new ObjectId(userId) });
        res.status(200).json(user);
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
