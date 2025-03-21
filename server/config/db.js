const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb+srv://poddar197:L0niv19sR0QN5oiA@cluster0.bjtsw.mongodb.net/virtualClassroomDB"; // Fallback URI
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


module.exports = connectDB;