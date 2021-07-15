module.exports = {
    name: "deposit",
    description: "dep",
    usage: "deposit <amount>",
    aliases: ['dep'],
    cooldown: 5, // Optional
    deleteAfter: 0, // Optional (-1 = dont delete | 0 = insta delete | 0> = delete after x seconds)
    async execute(message, args, cmd, client, Discord, prefix, profileData, profileModel) {
  
      const amount  = args[0]
      if (amount % 1 != 0 || amount <= 0) return message.channel.send('Deposit amount must be a whole number!')

      try {
        if (amount > profileData.coins) return message.channel.send(`You dont have that amount of coins to deposit!`)
        await profileMode.findOneAndUpdate({
          userID: message.author.id
        }, {
          $inc: {
            coins: -amount,
            bank: amount
          }
        })
      } catch (err) {
          console.log(err)
      }
  
    }
  }
  