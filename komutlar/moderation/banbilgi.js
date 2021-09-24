require("../../util/inlineReply"); //inlinereply module
const Discord = require('discord.js')

module.exports = {
    name: "banbilgi",
    aliases: ['banbak', 'bansebep'],
    permLvl: 0,
    guildOnly: true,
    description: "ID'si veya etiketi verilen kullanıcının sunucudaki yasaklama detaylarını getirir..",
    usage: `**unban KULLANICI ID** veya **<KULLANICI ADI#ETİKET>** yazarak komutu kullanabilirsiniz.`,
    category: "moderation",
    cooldown: 2,
    enabled: true,
    async run (message, args){
        if(!args.length) return message.inlineReply('Yasaklama detaylarına bakmak için bir kullanıcı ID\'si veya ETİKETİ belirtmelisin.')
        
        const banList =  await message.guild.fetchBans();
        let banDetails;
        const embed = new Discord.MessageEmbed();
        const matches = args[0].match(/^(\d+)$/);
        console.log(args, matches, banDetails);

        if(matches){ //id sorgulama
            
            const bannedID = matches[0];
            try{
                banDetails = banList.find(ban => ban.user.id == bannedID)
                if(!banDetails) return message.inlineReply(`${bannedID} Kullanıcısı sunucuda yasaklı değil.`)
            }
            catch(error){
                console.log(error)
                return message.inlineReply('Yasaklı listesi alınırken sorun oluştu.')
            }
        }
        else{ // tag sorgulama
            
            const bannedTag = args[0]
            try{
                banDetails = banList.find(ban => ban.user.tag == bannedTag)
                if(!banDetails) return message.inlineReply(`${bannedTag} Belirttiğin etiket hatalı veya bu etikette yasaklı bir kullanıcı yok. Etiketi kontrol edebilir veya ID ile sorgulama yapabilirsin.`)
            }
            catch(error){
                console.log(error)
                return message.inlineReply('Yasaklı listesi alınırken sorun oluştu.')
            }
        }
        
        embed.addField(`Yasaklanan Kullanıcı`, `\`\`\`Etiket:${banDetails.user.tag}\nID: ${banDetails.user.id}\`\`\``);
        embed.addField(`Yasaklanma Sebebi`, `\`\`\`${banDetails.reason ? banDetails.reason : 'Yok'}\`\`\``);
        embed.setThumbnail(banDetails.user.avatarURL({ size:4096, dynamic:true }));
        embed.setAuthor('Yasaklı Kullanıcı Detayları')
        embed.setTimestamp()
        embed.setColor('ORANGE')
        embed.setFooter(message.author.tag, message.author.avatarURL({ size:4096, dynamic:true }));

        message.client.sendEmbed(message.channel, embed, false);
    }
}