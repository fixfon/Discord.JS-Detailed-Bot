const Discord = require('discord.js')

require("../../util/inlineReply"); //inlinereply module

module.exports = {
    name: "istatistik",
    aliases: ["stats"],
    permLvl: 0,
    guildOnly: false,
    description: "Alfred hakkındaki detayları paylaşır.",
    usage: `**istatistik** yazarak komutu kullanabilirsin.`,
    category: "utility",
    cooldown: 3,
    enabled: true,
    async run (message, args){
        let botPing
        await message.inlineReply('İstatistikler Hesaplanıyor...').then(msg => {
            botPing = msg.createdTimestamp - message.createdTimestamp;
            msg.delete({ timeout:750 }).catch(() =>{})
        });

        const discordPing = message.client.ws.ping;
        
        const embed = new Discord.MessageEmbed()
            .setTitle("🧠 Alfred'in İstatistikleri")
            .setColor('RANDOM')
            .addField('➡️ Alfred\'in Bulunduğu Sunucu Sayısı', message.client.guilds.cache.size)
            .addField('➡️ Alfred ile Tanışmış Üye Sayısı', message.client.users.cache.size)
            .addField('➡️ Discord API Gecikmesi', `${discordPing}ms`)
            .addField('➡️ Alfred\'in Gecikmesi', `${botPing}ms`)
            .setThumbnail(message.client.user.avatarURL({ size:4096, dynamic:true }))
            .setFooter(`Developed by Fixfon#1111`, message.client.users.cache.get('278610070948806657').avatarURL({ size:4096, dynamic:true }));
        

        setTimeout(() =>{
            message.channel.send(embed);
        }, 1000);
    }
}