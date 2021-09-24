const Discord = require("discord.js");

module.exports = async (player, oldChannel, newChannel) => {

    console.log("Player Moved!")

    if(!newChannel) return player.destroy();

    else if(player){
        player.setVoiceChannel(newChannel)
        player.pause(true)
        return player.set("pausedBy", true);
        // buraya inaktivite eklenecek mi?
        console.log(player.voiceChannel);
    }
}