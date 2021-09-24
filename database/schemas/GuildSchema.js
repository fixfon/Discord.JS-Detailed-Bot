const mongoose = require('mongoose')

const guildSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    firstConfig: {
        type: Boolean,
        default: true,
    },
    registeredAt: {
        type: Date,
        required: true,
    },
    prefix: {
        type: String,
        default: "a!",
    },
    guildOwner: {
        type: String,
        required: true,
    },
    modRoles: { // if null perm level 2 only used by admin perms
        type: Array,
        default: [],
    },
    autoRole: {
        type: Map,
        default: {
            enabled: false,
            roleID: null,
        }
    },
    logEvents: {
        type: Map,
        default: {
            welcomeMessage: {
                enabled: false,
                channelID: null,
                message: null,
                embed: false,
            },
            memberInOutLog: {
                enabled: false,
                channelID: null,
            },
            messageLog: {
                enabled: false,
                channelID: null,
            },
            guildLog: { //channel create-delete-up  member update  guildupdate  role create-delete-update 
                enabled: false,
                channelID: null,
            },
            banKickLog: {
                enabled: false,
                channelID: null,
            },
            voiceLog: {
                enabled: false,
                channelID: null,
            },
        },
    },
    excludedChannels: {
        type: Array,
        default: [],
    },
    excludedCategories: {
        type: Array,
        default: []
    },
    musicSets: {
        type: Map,
        default: {
            commandChannelID: { //if null music commands can be used anywhere
                channelID: null
            }
        }
    }
})

module.exports = mongoose.model("GuildSchema", guildSchema);