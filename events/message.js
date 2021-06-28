const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")
const ms = require("ms");
const { prefix } = require('../prefix.json');

module.exports = async (message) => {
    
    if(!message.content.startWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    
}