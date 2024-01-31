const data = require('./data.json')
const NoiseMap = require('noise-map')
const Canvas = require('@napi-rs/canvas');


const game = {
    players: [],
    owner: '',
    expiry: 0,
    name: '',
    map: {}
}

class Game {
    expired = false;
    started = false;
    players = [];
    settings = {
        map: {
            size: 32,
            moist: 1.2,
            height: 1.4,
            moistf: 1,
            heightf: 1
        }
    }
    constructor(owner, name) {
        console.log(name, name ?? `${owner.username}'s Hunger Games`)
        this.owner = owner
        this.name = name ?? `${owner.username}'s Hunger Games`
        this.expiry = Date.now() + 300000

    }

    checkExpired() {
        if(this.expired) return false
        if(Date.now > this.expiry) return false
        else {
            this.expiry = Date.now() + 300000
            return true
        }
    }

    async genMap() {
        const generator = new NoiseMap.MapGenerator(config={generateSeed: true});
     
        const heightm = generator.createMap(this.settings.map.size, this.settings.map.size, {type: 'simplex', frequency: this.settings.map.heightf, amplitude: 1, generateSeed: true})
        for (let y = 0; y < heightm.height; y++) {
           for (let x = 0; x < heightm.width; x++) {
              heightm.set(x, y, Math.pow(heightm.get(x, y), this.settings.map.height))
           }   
        }
     
        const moisture = generator.createMap(this.settings.map.size, this.settings.map.size, {type: 'simplex', frequency: this.settings.map.moistf, amplitude: 1, generateSeed: true})
        for (let y = 0; y < moisture.height; y++) {
           for (let x = 0; x < moisture.width; x++) {
              moisture.set(x, y, Math.pow(moisture.get(x, y), this.settings.map.moist))
           }   
        }
        
        const mainmap = new hgMap(this.settings.map.size, this.settings.map.size, heightm, moisture);     
        mainmap.generate();    
  
        const canvas = Canvas.createCanvas(this.settings.map.size * 4, this.settings.map.size * 4);
        const ctx = canvas.getContext('2d');
        mainmap.drawMap(ctx, this.settings.map.size * 4, this.settings.map.size * 4)
        this.image = await canvas.encode('png')
        this.map = mainmap
    }
}

class Player {
    district;
    index;
    status = {
        health: 100,
        hunger: 5,
        thirst: 3,
        alliances: [],
    }
    inventory = []
    position = {x: 0, y: 0, biome: null}
    constructor(name, image, game, discord) {
        this.name = name
        this.image = image
        this.discord = discord
        this.game = game
    }
    //move around the map
    calcMovement() {

    }
    move(x, y) {
        if (map(this.position.x)) {

        }
    }
}

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
            this.set(x, y, this.getBiome(x, y, this.heightm, this.moisture));
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

    getBiome(x, y, heightm, moisture) {
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


function scale(x, oldMin, oldMax, newMin, newMax) {
   return newMin + (newMax - newMin) * (x - oldMin) / (oldMax - oldMin);
}
module.exports = {
    Game: Game,
    Player: Player
}
