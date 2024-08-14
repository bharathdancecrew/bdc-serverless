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

        const user = await users.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Compare provided password with hashed password in database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        // Return the user without the password field
        const { password: pwd, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
