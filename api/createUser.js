const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    try {
        await client.connect();
        const database = client.db("mydbname");
        const users = database.collection("users");

        const user = await users.insertOne(req.body);
        res.status(201).send({ status: 'User created', userId: user.insertedId });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
