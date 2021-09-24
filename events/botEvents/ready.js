const GuildSchema = require('../../database/schemas/GuildSchema')
const mongo = require('../../database/db')

module.exports = async (client) => {

    console.log(`${client.user.tag} olarak sunucuya giriş yapıldı!`);

    client.manager.init(client.user.id);

    await mongo().then(async (mongoose) => {
        try {
            console.log('Connected to MongoDB')
            const guilds = client.guilds.cache.array()
            for (guild of guilds) {
                let config = await GuildSchema.findById(guild.id).catch(error => console.log(error));
                if (!config) {
                    const date = guild.members.cache.get('855428026141638686').joinedAt
                    config = await GuildSchema.create({
                        _id: guild.id,
                        registeredAt: date,
                        guildOwner: guild.ownerID
                    }).catch(error => console.log(error))
                    client.config.set(guild.id, config)
                } else {
                    client.config.set(guild.id, config)
                }
            }
        } catch (e) {
            console.log(e)
        } finally {
            // mongoose.connection.close();
        }
    }).catch(err => console.log(err));

}