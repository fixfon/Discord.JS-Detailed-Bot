const { MessageEmbed } = require('discord.js')


module.exports = async (channel, content, deleted = false, timeout = 10000, user) => {
    let embed;

    if (content instanceof MessageEmbed) embed = content;
    else embed = new MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL({
            size: 4096,
            dynamic: true
        }))
        .setDescription(content);
    embed.setTimestamp()

    const sended = await channel.send({embed: embed});

    if (deleted) await sended.delete({
        timeout
    });

    return sended;
}