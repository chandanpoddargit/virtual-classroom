const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({
    path: './.env'
})

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI 
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;


// module.exports = connectDB;