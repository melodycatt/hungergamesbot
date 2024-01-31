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

class hgMap {
    static COLORS = {
       OCEAN: ['#004e82', 'OCEAN'],
       POND: ['#027ed1', 'POND'],
       DESERT: ['#ffd505', 'DESERT'],
       SCORCHED: ['#ffa305', 'SCORCHED'],
       SAVANNAH: ['#c7d907', 'SAVANNAH'],
       PLAINS: ['#00b518', 'PLAINS'],
       FOREST: ['#017811', 'FOREST'],
       JUNGLE: ['#05fc11', 'JUNGLE'],
       SWAMP: ['#002e02', 'SWAMP'],
       TAIGA: ['#002e18', 'TAIGA'],
       SNOWY_TAIGA: ['#254536', 'SNOWY_TAIGA'],
       TUNDRA: ['#8ba699', 'TUNDRA'],
       MOUNTAINS: ['#858585', 'MOUNTAINS'],
       ROCKY_MOUNTAINS: ['#2d2e2e', 'ROCKY_MOUNTAINS'],
       TAIGA_MOUNTAINS: ['#16241d', 'TAIGA_MOUNTAINS'],
       SNOWY_MOUNTAINS: ['#a1a1a1', 'SNOWY_MOUNTAINS'],
       WMOUNTAINS: ['#e3e3e3', 'WMOUNTAINS'],
    }
 
    constructor(width, height, heightm, moisture) {
       console.log(width, height, heightm, moisture);
       this.heightm = heightm
       this.moisture = moisture
       this.width = width;
       this.height = height;
       this.data = new Array(height * width).fill(0);
    }
 
    generate() {
       for (let y = 0; y < this.height; y++) {
          for(let x = 0; x < this.width; x++) {
             this.set(x, y, getBiome(x, y, this.heightm, this.moisture));
          }
       }     
    }
    
    set(x, y, value) {
       this.data[y * this.width + x] = value;
    }
 
    get(x, y) {
       return this.data[y * this.width + x];
    }
    
    drawMap(context, width, height) {
       var cellwidth = width / this.width;
       var cellheight = height / this.height;
       for(let y = 0; y < this.height; y++) {
          for(let x = 0; x < this.width; x++) {
             try {               
                context.fillStyle = this.get(x,y)[0] // this.getColor(heightm.get(x, y), this.get(x, y)[0]);
             } catch (error) {
                console.log(x, y, "POOPY ERROR :( FIX IT NOW", error, heightm);
             }
             context.fillRect(x * cellwidth, y * cellheight, cellwidth, cellheight);
          }
       }
    }
    
    getColor(value, color) {
       var rgb = hexToRgb(color);
       var r = this.interpolate(value*rgb[0], color, rgb[0], 0);
       var g = this.interpolate(value*rgb[1], color, rgb[1], 1);
       var b = this.interpolate(value*rgb[2], color, rgb[2], 2);
       console.log("rgb(" + r + "," + g + "," + b + ")")
       return "rgb(" + r + "," + g + "," + b + ")";
    }
 
    interpolate(t, hex, next, rgb) {
       var prev = hexToRgb(Object.values(hgMap.COLORS).map(x => x[0])[Object.values(hgMap.COLORS).map(x => x[0]).indexOf(hex) - 1])[rgb];
       
       if (t == next) {
          return next;
       }
       if (t < next) {
          return Math.floor(scale(t, prev, next, prev, next) == NaN ? 1 : scale(t, prev, next, prev, next));
       }
       return 'guh?';
    }
 }
 
 
 
 function getBiome(x, y, heightm, moisture) {
    console.log('hi')
    if (heightm.get(x, y) < 0.2 && moisture.get(x, y) > 0.3) {
       if (moisture.get(x,y) > 0.7) return hgMap.COLORS.OCEAN
       return hgMap.COLORS.POND
    } 
    if (heightm.get(x, y) < 0.3){
       if (moisture.get(x, y) < 0.1) return hgMap.COLORS.SCORCHED
       if (moisture.get(x, y) < 0.2) return hgMap.COLORS.DESERT
       return hgMap.COLORS.SAVANNAH
    }
    if (heightm.get(x, y) < 0.5) {
       if (moisture.get(x, y) < 0.4) return hgMap.COLORS.PLAINS
       if (moisture.get(x, y) < 0.7) return hgMap.COLORS.FOREST
       if (moisture.get(x, y) < 0.8) return hgMap.COLORS.JUNGLE
       return hgMap.COLORS.SWAMP
    }
    if (heightm.get(x, y) < 0.8) {
       if (moisture.get(x, y) < 0.4) return hgMap.COLORS.TAIGA
       if (moisture.get(x, y) < 0.7) return hgMap.COLORS.SNOWY_TAIGA
       return hgMap.COLORS.TUNDRA
    }
    if (moisture.get(x, y) < 0.1) return hgMap.COLORS.MOUNTAINS
    if (moisture.get(x, y) < 0.3) return hgMap.COLORS.ROCKY_MOUNTAINS
    if (moisture.get(x, y) < 0.6) return hgMap.COLORS.TAIGA_MOUNTAINS
    if (moisture.get(x, y) < 0.9) return hgMap.COLORS.SNOWY_MOUNTAINS
    return hgMap.COLORS.WMOUNTAINS
 }
 
 const generator = new NoiseMap.MapGenerator(config={generateSeed: true});
 
 function scale(x, oldMin, oldMax, newMin, newMax) {
    return newMin + (newMax - newMin) * (x - oldMin) / (oldMax - oldMin);
 }
