//REPLIT
const keepAlive = require('./server.js');

const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const client = new Discord.Client();

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

//Mongoose
mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('Connected to to the database!')
}).catch((err) => {
    console.log("Database Error: " + err)
})

//REPLIT
keepAlive();
client.login(process.env.TOKEN)