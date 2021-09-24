require("../../util/inlineReply"); //inlinereply module
const {
    readdirSync
} = require('fs');

module.exports = {
    name: "reload",
    aliases: ["yenile", "r"],
    permLvl: 0,
    guildOnly: true,
    developerOnly: true,
    description: "dsa",
    usage: "dsa",
    category: "owner",
    cooldown: 5,
    enabled: true,
    async run(message, args) {
        const prefix = message.client.config.get(message.guild.id).get('prefix')
        if (!args.length) {return message.inlineReply(`**${prefix}reload** komutunu kullanabilmek için bir komut ismi veya tüm komutlar için **all** argümanını belirtmelisin.`).then(msg => {
            msg.delete({ timeout:5000 }).catch(() =>{})
            if (message.channel.type != "dm") message.delete({ timeout:5000 }).catch(() =>{})
        })}

        const client = message.client
        const commandName = args[0].toLowerCase();

        if (commandName !== "all") {
            const command = client.commands.get(commandName) || client.commands.find(cmnd => cmnd.aliases && cmnd.aliases.includes(commandName));

            if (!command) {
                return message.inlineReply(`Komutlar arasında ${commandName} isimli bir komut bulunmamakta. Reload komutunu kullanmak için 
            **${prefix}reload KOMUTİSMİ** veya **all** yazarak tüm komutları yenileyebilirsin.`).then(msg => {
                    msg.delete({
                        timeout: 5000
                    }).catch(() =>{})
                    if (message.channel.type != "dm") message.delete({ timeout: 5000 }).catch(() =>{})
                })
            }

            const commandFolders = readdirSync('./komutlar');
            const folderName = commandFolders.find(folder => readdirSync(`./komutlar/${folder}`).includes(`${command.name}.js`))
            delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

            // delete require.cache[require.resolve(`./${command.name}.js`)];
            const reloadedCmd = require(`../${folderName}/${command.name}.js`)
            client.commands.set(command.name, reloadedCmd)

            message.inlineReply(`**${command.name}** Komutu başarıyla yenilendi! Komutlar hakkında detaylı bilgi almak için **${prefix}help** veya komut adıyla Alfred'den yardım isteyebilirsin.`)
                .then(msg => {
                    msg.delete({ timeout:3500 }).catch(() =>{})
                    if (message.channel.type != "dm") message.delete({ timeout:3500 })}).catch(() =>{});

        } else if (commandName === "all") {
            const commandFolders = readdirSync('./komutlar');
            client.commands.forEach(cmd => {
                const folderName = commandFolders.find(folder => readdirSync(`./komutlar/${folder}`).includes(`${cmd.name}.js`))
                delete require.cache[require.resolve(`../${folderName}/${cmd.name}.js`)];
                const reloadedCmd = require(`../${folderName}/${cmd.name}.js`)
                client.commands.set(cmd.name, reloadedCmd)
            })
            message.inlineReply(`Tüm komutlar başarıyla yenilendi! Komutlar hakkında detaylı bilgi almak için **${prefix}help** veya komut adıyla Alfred'den yardım isteyebilirsin.`)
            .then(msg => {
                msg.delete({ timeout:3500 }).catch(() =>{})
                if (message.channel.type != "dm") message.delete({ timeout:3500 })}).catch(() =>{});
        }
    }
}