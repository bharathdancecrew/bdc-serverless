const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    const { email, password, phone } = req.body; // Add phone to the destructured request body

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const users = database.collection("users");

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if a user already exists with the same email or phone number
        const existingUser = await users.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            res.status(400).send({ message: 'A user already exists with the given email or phone number' });
            return;
        }

        // Insert the new user with hashed password and other details
        const newUser = await users.insertOne({ email, phone, password: hashedPassword });
        res.status(201).send({ status: 'User created', userId: newUser.insertedId });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();  // Ensure the client is closed after operations are complete
    }
};
