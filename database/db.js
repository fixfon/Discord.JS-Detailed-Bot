const mongoose = require('mongoose')
require("dotenv").config({ path: '/.'});
const mongoPath = process.env.MONGO_DB

module.exports = async () => {
    await mongoose.connect(mongoPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        keepAlive: true,
        socketTimeoutMS: 120000,
    }).catch(error => console.log(error))

    mongoose.connection
        .on('open', () => console.log('Mongoose connected and listening...'))
        .on('error', (err) => console.log(err))
        .on('disconnected', () => console.log('Mongoose connection disconnected.'))
    return mongoose;
}
