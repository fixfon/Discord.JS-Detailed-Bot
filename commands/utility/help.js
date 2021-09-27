// const { prefix } = require("../../prefix.json")
const Discord = require('discord.js')
const moment = require("moment"); //date
moment.locale("tr") //date localization

module.exports = {
    name: "help",
    aliases: ["komutyardım", "yardım", "komutlar"],
    permLvl: 0,
    guildOnly: false,
    description: "Komutlar hakkında açıklama ve kullanımı hakkında bilgilendirme sağlar.",
    usage: `**help** VEYA **help <KOMUTİSMİ>** şeklinde kullanarak yardım alabilirsin.`,
    category: "utility",
    cooldown: 2,
    enabled: true,
    async run (message, args){
        const client = message.client
        const prefix = client.config.get(message.guild.id).get('prefix')

        if(!args.length) { // tüm komutları getirir.

            const embed = new Discord.MessageEmbed()
                .setTitle('Alfred\'in Tüm Komutları')
                .setColor('#00ffc8')
                .setFooter(`${message.author.username}`, message.author.avatarURL({ size:4096, dynamic:true }))
                .setTimestamp()
                .setDescription(`[Destek Sunucusu İçin Tıkla](https://discord.gg/tASC7UaF)`)
                .setThumbnail(message.client.user.avatarURL({ size:4096, dynamic:true }))
                .addField(`Alfred'in Ön Eki: **${prefix}**`, '\u200b');

            const modCmd = client.commands.filter(cmd => cmd.category === "moderation")
            embed.addField(`🔑  Moderasyon`, modCmd.size ? modCmd.map(cmd => cmd.name).join("\n") : "boş");

            const funCmd = client.commands.filter(cmd => cmd.category === "fun")
            embed.addField(`👻  Eğlence`, funCmd.size ? funCmd.map(cmd => cmd.name).join("\n") : "boş");

            const utilCmd = client.commands.filter(cmd => cmd.category === "utility")
            embed.addField(`🛸  İşlevsellik`, utilCmd.size ? utilCmd.map(cmd => cmd.name).join("\n") : "boş");

            const musicCmd = client.commands.filter(cmd => cmd.category === "music")
            embed.addField(`🎧  Medya`, musicCmd.size ? musicCmd.map(cmd => cmd.name).join("\n") : "boş");

            const ecoCmd = client.commands.filter(cmd => cmd.category === "economy")
            embed.addField(`💳  Ekonomi ve Oyunlar`, ecoCmd.size ? ecoCmd.map(cmd => cmd.name).join("\n") : "boş");

            embed.addField(`\u200b`, `**help <KOMUTİSMİ>** ile her komut için detayları görebilirsin.`)
            
            return message.channel.send(embed);
        }
        else {
            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName) || client.commands.find(cmnd => cmnd.aliases && cmnd.aliases.includes(commandName));
            
            if(!command) {
                const errorEmbed = new Discord.MessageEmbed()
                    .setTitle(`Komut Detayları Aranırken Hata Oluştu!`)
                    .setColor('#fca103')
                    .setFooter(`${message.author.username}`, message.author.avatar ? message.author.avatarURL({ size:4096, dynamic:true }) : null)
                    .setTimestamp()
                    .setDescription('Böyle bir komut bulunmamakta!');
                
                return message.channel.send(errorEmbed);
            }

            const embed = new Discord.MessageEmbed()
                .setTitle(`${prefix + command.name} Komut Detayları`)
                .setColor('#00ffc8')
                .setFooter(`${message.author.username}`, message.author.avatarURL({ size:4096, dynamic:true }))
                .setTimestamp()
                .setDescription(`[Destek Sunucusu İçin Tıkla](https://discord.gg/tASC7UaF)`)
                .addField(`Tüm komutları görmek için ${prefix}help`, '\u200b')
                .addField('💾  Komut Açıklaması', command.description)
                .addField('🕹️  Komut Kullanımı', command.usage)
                .addField('🏷️  Komut Yan Adları', command.aliases.length ? command.aliases.join(', ') : '\u200b');
            
            return message.channel.send(embed)
        }
    }
}