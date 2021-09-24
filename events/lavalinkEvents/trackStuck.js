const Discord = require("discord.js");

module.exports = async (player, track, payload) => {

    console.log("A track stucked! Should be played again!")
    console.log(player.playing);
    console.log(payload);

}