const { createCanvas, loadImage, registerFont } = require('canvas')
registerFont("./roboto.ttf", { family: "Roboto" })

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 60;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return context.font;
};

const applyCornerTextX = (canvas, text, xp) => {
	const context = canvas.getContext('2d');

  let xPos;

  if (!xp) {
    xPos = canvas.width - context.measureText(text).width - 10
  } else {
    xPos = canvas.width - context.measureText(text).width - 35
  }
  
	return xPos;
};

module.exports = {
  name: "rank",
  description: "Returns your current rank!",
  aliases: ['level', 'r'],
  cooldown: 5, // Optional
  deleteAfter: 0, // Optional (-1 = dont delete | 0 = insta delete | 0> = delete after x seconds)
  async execute(message, args, cmd, client, Discord, prefix, profileData, profileModel, serverData, serverModel) {

    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('./images/RankBackground.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);    

    //Username
    ctx.font = applyText(canvas, message.author.username) //message.member.displayName for nickname
    ctx.fillStyle = '#ffffff';
    ctx.fillText(message.author.username, 225, 125);

    //Rank
    ctx.font = '30px sans-serif'
    ctx.fillStyle = '#9c9c9c';
    ctx.fillText(`Rank #NotImplemented`, applyCornerTextX(canvas, `Rank #NotImplemented`, false), 35);

    //Level
    ctx.font = '28px sans-serif'
    ctx.fillStyle = '#9c9c9c';
    ctx.fillText(`Level: ${profileData.level}`, applyCornerTextX(canvas, `Level: ${profileData.level}`, false), 70);

    //Xp
    ctx.font = '25px sans-serif'
    ctx.fillStyle = '#9c9c9c';
    ctx.fillText(`Xp: ${profileData.xp}`, applyCornerTextX(canvas, `Xp: ${profileData.xp}`, true), 228);


    const avatar = await loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
    let avatarSize = 150
    let avatarLocationX = 40
    let avatarLocationY = 50
    ctx.arc(avatarLocationX + avatarSize/2, avatarLocationY + avatarSize/2, avatarSize/2 + 8, 0, Math.PI * 2);
    ctx.fillStyle = "#232323";
    ctx.fill();
    // Pick up the pen
	  ctx.beginPath();
	  // Start the arc to form a circle
	  ctx.arc(avatarLocationX + avatarSize/2, avatarLocationY + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
	  // Put the pen down
	  ctx.closePath();
	  // Clip off the region you drew on
	  ctx.clip();

    ctx.drawImage(avatar, avatarLocationX, avatarLocationY, avatarSize, avatarSize);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'RankCard.png');

    message.channel.send("", attachment);
  }
}