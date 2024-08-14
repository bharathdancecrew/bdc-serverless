// api/sendOtp.js

const { MongoClient } = require('mongodb');
const twilio = require('twilio');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = async (req, res) => {
    const { phone } = req.body;

    try {
        await client.connect();
        const database = client.db("bdcusers");
        const otps = database.collection("otps");

        const otp = Math.floor(100000 + Math.random() * 900000);  // Generate a 6-digit OTP

        // Store OTP in the database with a timestamp
        await otps.updateOne({ phone }, { $set: { otp, timestamp: new Date() } }, { upsert: true });

        // Send OTP via SMS
        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        res.status(200).send({ message: 'OTP sent successfully.' });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e.message });
    } finally {
        await client.close();
    }
};
