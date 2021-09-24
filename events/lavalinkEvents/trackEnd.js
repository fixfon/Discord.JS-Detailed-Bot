const Discord = require("discord.js");

module.exports = async (player, track, payload) => {

    console.log("A track ended!")
    player.set("guildSkipVote", false);
}