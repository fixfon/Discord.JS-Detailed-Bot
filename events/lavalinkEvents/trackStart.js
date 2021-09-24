const Discord = require("discord.js");

module.exports = async (player, track, payload) => {

    if(player) player.set("inactivity", false);

    console.log(player.queue.current.requester) //unresolved track olayına bak.

    console.log("A track started! Should be playing")

}