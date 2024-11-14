const mongoose = require('mongoose')

function  connectionToDB() {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log('Connected to DB')
    })
}

module.exports = connectionToDB