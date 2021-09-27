require("../../util/inlineReply"); //inlinereply module
const Discord = require('discord.js')

module.exports = {
    name: "clear",
    aliases: ["toplusil", "toplumesajsil", "temizle"],
    permLvl: 0,
    guildOnly: true,
    description: "Metin kanalından toplu miktarda mesaj siler.",
    usage: `**clear <SİLİNECEK MESAJ ADEDİ>**`,
    category: "moderation",
    cooldown: 5,
    enabled: true,
    async run (message, args){
        if(message.channel.type != "text") return message.inlineReply('Bu komut yalnızca sunucu metin kanallarında çalışmaktadır.');
        if(!args.length) return message.inlineReply('Silinecek mesaj adedini belirtmelisin.')
        const amount = parseInt(args[0])

        if(isNaN(amount)) return message.inlineReply('Geçerli bir sayı girmelisin')

        else if(amount < 2 || amount > 99) return message.inlineReply('Girdiğin sayı değeri 2 ile 99 arasında olmalıdır.')

        const client = message.client

        await message.channel.bulkDelete(amount + 1, true)
        .then((deletedMList) => {
            const embed = new Discord.MessageEmbed()
                .setColor('#f542f2')
                .setAuthor(`${deletedMList.size - 1} adet mesaj silindi.`, client.user.avatarURL({ size:4096, dynamic:true }))
                .setFooter(message.author.tag, message.author.avatar ? message.author.avatarURL({ size:4096, dynamic:true }): null)
                .setTimestamp();
            
            client.sendEmbed(message.channel, embed, true, 5000);

            if (!client.config.get(message.guild.id).get('logEvents').get('messageLog').enabled &&
            !client.config.get(message.guild.id).get('logEvents').get('messageLog').channelID) return
    
            const logCh = message.guild.channels.cache.find(ch => ch.id == client.config.get(message.guild.id).get('logEvents').get('messageLog').channelID)
    
            if(!logCh) return
            const embed2 = new Discord.MessageEmbed()
                .setColor('#f542f2')
                .setAuthor('Toplu Mesaj Silindi!', client.user.avatarURL({ size:4096, dynamic:true }))
                .setTimestamp()
                .setDescription(`Mesajların Silindiği Kanal: ${message.channel}\nSilinen Mesaj Adedi: ${deletedMList.size - 1}`)
                .setFooter(`Mesajları Silen Kişi: ${message.author.tag}`, message.author.avatar ? message.author.avatarURL({ size:4096, dynamic:true }): null);
            
            return client.sendEmbed(logCh, embed2, false);
        })
        .catch(err => {
            console.log(err)
            return message.channel.send('14 günden eski mesajlar silinirken bir hata oluştu.')
        })
    }
}