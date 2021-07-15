module.exports = {
    name: "prefix",
    description: "Changes the server prefix",
    usage: "prefix <newPrefix>",
    permissions: ['ADMINISTRATOR', 'MANAGE_GUILD'],
    botPerms: ['CHANGE_NICKNAME'],
    cooldown: 5, // Optional
    deleteAfter: 0, // Optional (-1 = dont delete | 0 = insta delete | 0> = delete after x seconds)
    async execute(message, args, cmd, client, Discord, prefix, profileData, profileModel, serverData, serverModel) {
  
        const prefixSameEmbed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setDescription(`Please choose a prefix different than the current one.`);

        const prefixShortEmbed = new Discord.MessageEmbed()
            .setColor('#CCCC00')
            .setDescription(`Current Prefix: **${prefix}**`);

        const prefixLongEmbed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setDescription(`Please only use one argument | ${this.usage}`);

        const prefixNumEmbed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setDescription(`Please dont use a number as the prefix | ${prefix}prefix <newPrefix>`);

        const prefixChangedEmbed = new Discord.MessageEmbed()
            .setColor('#00FF04')

            if (args[0] && prefix !== args[0] && args.length === 1 && isNaN(args[0])) {
                const response = await serverModel.findOneAndUpdate({
                    serverID: message.guild.id
                }, {
                    $set: {
                        prefix: args[0]
                    }
                })
                prefixChangedEmbed.setDescription(`Prefix succesfully changed, the new prefix is **${args[0]}**`);
                message.guild.members.cache.get(client.user.id).setNickname(`Archon [${args[0]}]`)
                return message.channel.send(prefixChangedEmbed);
            } else if (prefix === args[0]) {
                return message.channel.send(prefixSameEmbed);
            } else if (args[1]) {
                return message.channel.send(prefixLongEmbed);
            } else if (!args[0]) {
                return message.channel.send(prefixShortEmbed);
            } else if (!isNaN(args[0])) {
                return message.channel.send(prefixShortEmbed);
            }
  
    }
  }