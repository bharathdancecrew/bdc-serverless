// api/verifyOtpAndCreateUser.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    const { email, password, phone, otp } = req.body;

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const otps = database.collection("otps");
        const users = database.collection("users");

        // Verify OTP
        const record = await otps.findOne({ phone });
        if (!record || record.otp !== otp || (new Date() - record.timestamp) > 300000) { // 5 minutes expiration
            res.status(400).send({ message: 'Invalid or expired OTP' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check for existing user
        const existingUser = await users.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            res.status(400).send({ message: 'User already exists with the given email or phone number' });
            return;
        }

        // Create user
        const newUser = await users.insertOne({ email, phone, password: hashedPassword, name });
        res.status(201).send({ message: 'User created successfully', userId: newUser.insertedId });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
