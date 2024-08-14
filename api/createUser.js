const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    const { email, password } = req.body;
    try {
        await client.connect();
        const database = client.db("bdcusers");
        const users = database.collection("users");

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            res.status(400).send({ message: 'User already exists' });
            return;
        }

        // Insert new user with hashed password
        const newUser = await users.insertOne({ email, password: hashedPassword });
        res.status(201).send({ status: 'User created', userId: newUser.insertedId });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
