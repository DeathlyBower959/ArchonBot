module.exports = {
    name: "beg",
    description: "Beg for money xD",
    cooldown: 60, // Optional
    deleteAfter: 0, // Optional (-1 = dont delete | 0 = insta delete | 0> = delete after x seconds)
    async execute(message, args, cmd, client, Discord, prefix, profileData, profileModel) {
  
      const randomNumber = Math.floor(Math.random() * 500) + 1
      const response = await profileModel.findOneAndUpdate({
          userID: message.author.id
      }, {
          $inc: {
              coins: randomNumber
          }
      })
      
      message.channel.send(`You begged and recieved ${randomNumber} coins!`)
    }
  }
  