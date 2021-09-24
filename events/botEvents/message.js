const Discord = require("discord.js");
require("dotenv").config({ path: '/.'});
require("../../util/inlineReply"); //inlinereply module
require('../../')
const cooldowns = new Discord.Collection(); //coldown tracker

module.exports = async (message) => {

    const client = message.client
    const prefix = message.client.config.get(message.guild.id).get('prefix')

    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmnd => cmnd.aliases && cmnd.aliases.includes(commandName));

    if(!command) return message.inlineReply('Komutlar arasında böyle bir komut bulunmamakta.')

    if(command.guildOnly && message.channel.type == "dm") return message.inlineReply("Bu komut yalnızca sunucularda çalışmaktadır.")

    if(command.developerOnly && message.author.id != process.env.DEVELOPER_ID) return;

    if(!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection())

    const timestamp = cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown || 3) * 1000;
    const now = Date.now()

    if(timestamp.has(message.author.id)){
        const expritaionDate = timestamp.get(message.author.id) + cooldownAmount;
        if(expritaionDate > now){
            const timeLeft = (expritaionDate - now) / 1000;
            
            message.inlineReply(`Bu komutu tekrar kullanabilmek için ${parseInt(timeLeft)} saniye beklemelisin.`).then(msg => {
                msg.delete({ timeout: 1000}).catch(() =>{})
                if(message.channel.type != "dm") message.delete().catch(() =>{})
            });
            
            return;
        }
    }
    
    timestamp.set(message.author.id, now);
    setTimeout(() => {
        timestamp.delete(message.author.id)
    }, cooldownAmount);
    
    await command.run(message, args)
    .catch((e) => {
        message.inlineReply('Komutu çalıştırırken bir sorun oluştu.')
        console.log(e)
    })

    // PERM CONTROL
    /*
    0- CAN BE USED BY EVERYONE
    1- CAN BE USED BY ARRANGED ROLES(IF NOT FOR THAT COMMAND AND THAT GUILD, CAN BE USED BY EVERYONE)
    2- CAN BE USED BY MODERATORS(ADMINISTRATOR PERMISSIONS AND ARRANGED ROLES)
    3- CAN BE USED BY GUILD OWNERS
    4- CAN BE USED BY BOT OWNER
    */
}