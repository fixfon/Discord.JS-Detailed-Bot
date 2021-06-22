const req = file => require(`../events/${file}`);

module.exports = client => {
  // client.on("message", req("message"));

  // client.on("ready", () => req("ready")(client));

  client.on("guildMemberAdd", req("guildMemberAdd.js"));

  client.on("guildMemberRemove", req("guildMemberLeave.js"));

  // client.on("guildMemberUpdate", req("guildMemberUpdate.js"));

  // client.on("messageDelete", req("messageDelete.js"));

  // client.on("messageUpdate", req("messageUpdate.js"));

  // client.on("roleCreate", req("roleCreate.js"));

  // client.on("roleDelete", req("roleDelete.js"));

  // client.on("roleUpdate", req("roleUpdate.js"));

  client.on("channelCreate", req("channelCreate.js"));

  client.on("channelDelete", req("channelDelete.js"));

  client.on("channelUpdate", req("channelUpdate.js"));

  // client.on("voiceStateUpdate", req("voiceLog.js"));
};