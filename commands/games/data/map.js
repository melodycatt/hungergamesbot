const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const NoiseMap = require('noise-map')
const Canvas = require('@napi-rs/canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Provides information about the user.')
        .addNumberOption(option =>
            option.setName("size")
                .setDescription("Size of the map")
                .setMinValue(16)
                .setMaxValue(256)
        )
        .addNumberOption(option =>
            option.setName("moisture")
                .setDescription("Average moistness of the map")
                .setMinValue(0.1)
                .setMaxValue(3)
        )
        .addNumberOption(option =>
            option.setName("height")
                .setDescription("Average height of the map")
                .setMinValue(0.1)
                .setMaxValue(3)
        )
        .addNumberOption(option =>
            option.setName("moistfrequency")
                .setDescription("How chaotic the moistness levels are")
                .setMinValue(0.1)
                .setMaxValue(2)
        )
        .addNumberOption(option =>
            option.setName("heightfrequency")
                .setDescription("How spiky the terrain is")
                .setMinValue(0.1)
                .setMaxValue(2)
        )
        ,
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild  
      const height = interaction.options.getNumber('height') ?? 1.4
      const moist = interaction.options.getNumber('moisture') ?? 1
      const heightf = interaction.options.getNumber('heightfrequency') ?? 1
      const moistf = interaction.options.getNumber('moistfrequency') ?? 1
      const size = interaction.options.getNumber('size') ?? 32
   
      const heightm = generator.createMap(size, size, {type: 'simplex', frequency: heightf, amplitude: 1, generateSeed: true})
      for (let y = 0; y < heightm.height; y++) {
         for (let x = 0; x < heightm.width; x++) {
            heightm.set(x, y, Math.pow(heightm.get(x, y), height))
         }   
      }
   
      const moisture = generator.createMap(size, size, {type: 'simplex', frequency: moistf, amplitude: 1, generateSeed: true})
      for (let y = 0; y < moisture.height; y++) {
         for (let x = 0; x < moisture.width; x++) {
            moisture.set(x, y, Math.pow(moisture.get(x, y), moist))
         }   
      }
      
      const mainmap = new hgMap(size, size, heightm, moisture);     
      mainmap.generate();    

      const canvas = Canvas.createCanvas(size * 4, size * 4);
      const ctx = canvas.getContext('2d');
      mainmap.drawMap(ctx, size * 4, size * 4)
      const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });

      interaction.reply({content: `${height}, ${moist}, ${heightf}, ${moistf}, ${size}`, files: [attachment] });
	},
};

