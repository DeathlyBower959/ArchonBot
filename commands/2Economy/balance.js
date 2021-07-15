module.exports = {
  name: "balance",
  description: "Returns your current amount of coins!",
  aliases: ['bal'],
  cooldown: 5, // Optional
  autoDelete: true, // Optional
  deleteAfter: 0, // Optional (-1 = dont delete | 0 = insta delete | 0> = delete after x seconds)
  async execute(message, args, cmd, client, Discord, prefix, profileData) {

    const balanceEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setAuthor(`${message.author.username}'s Balance`, message.author.displayAvatarURL([dynamic = true]))
      .setDescription(`Current Balance: ${profileData.coins}\nBank: ${profileData.bank}`)

    
    message.channel.send(balanceEmbed)

  }
}
