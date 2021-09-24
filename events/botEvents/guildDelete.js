const Discord = require("discord.js");

module.exports = async (guild) => {
    const { client } = guild;

    try {
        let player = client.manager.players.get(guild.id)

        if(player && guild.id == player.guild) {
            player.destroy();
        }
    } catch (error) {
        console.log(error);
    }

    //dm the guild owner.

    const guildOwner = guild.ownerID;
    console.log(guildOwner);
    // const owner = client.users.get(guildOwner);

    // if(!owner) return console.log("No owner found!");

    // await owner.send("Neden sunucudan attın beni?").catch(err => console.log(err));

}