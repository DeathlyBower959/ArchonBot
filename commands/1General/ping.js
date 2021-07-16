module.exports = {
  name: "ping",
  description: "Gets the ping of the bot",
  cooldown: 5, // Optional
  deleteAfter: 0, // Optional (-1 = dont delete | 0 = insta delete | 0> = delete after x seconds)
  async execute(message, args, cmd, client, Discord, prefix, profileData, profileModel, serverData, serverModel) {

    const timeTaken = Date.now() - message.createdTimestamp;
    const pingEmbed = new MessageEmbed()
    .setColor('#CCCC00')
    .setDescription(`🏓 Current Ping: ${timeTaken}ms.`);

    message.channel.send(pingEmbed);

  }
}
