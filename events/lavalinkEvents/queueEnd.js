const Discord = require("discord.js");

module.exports = async (client, player) => {

    if (player) player.set("inactivity", true)
    player.set("guildSkipVote", false);
    setTimeout(async () => {
        if(player && player.get("inactivity")) {

            const musicCmdCh = client.config.get(player.guild).get('musicSets').commandChannelID

            if(musicCmdCh) await musicCmdCh.send('Sesli odadaki inaktiviteden dolayı Alfred kanaldan ayrıldı.')

            return player.destroy()
        }
    }, 140000)
    console.log("A queue ended!")
    return;
}