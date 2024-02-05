const NoiseMap = require('noise-map')
const Canvas = require('@napi-rs/canvas');
const { isMainThread } = require('worker_threads');
const fs = require('node:fs');
const path = require('node:path');
const chalk = import('chalk')

class Game {
    expired = false;
    started = false;
    players = [];
    roundNo = 0
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

    nextround() {
        if (this.roundNo === 0) {
			let result = []
            for (let i in this.players) {
                let actionChance = 1
                while (Math.random() <= actionChance) {
                    result.push(this.players[i].newAction(this.players.length))
                    for(let j in result[result.length - 1][3]) {
                        this.players.splice(this.players.map(obj => obj.discord.id).indexOf(j), 1)
                    }
					console.log(this.players[i].status, this.players[i].inventory)
                    actionChance *= 0.6
                }
            }
			return result
        }

    }

	static toGame(obj) {
		let result = new Game(obj.owner, obj.name)
		result.expiry = Date.now() + 300000
		result.expired = obj.expired
		result.started = obj.started
		result.settings = obj.settings
		result.players = obj.players
        result.map = obj.map
        result.image = obj.image
        result.roundNo = obj.roundNo
		for (let i in result.players) {
			result.players[i] = Player.toPlayer(result.players[i])
		}
		result.roundNo = obj.roundNo
		return result
	}

    get round() {
        if (this.roundNo === 0) return "Bloodbath"
        if (this.roundNo % 2) return `Day ${Math.ceil(this.roundNo / 2)}`
        else return `Night ${this.roundNo / 2}`
    }
}

class Player {
    static ACTIONS = [
        {
            text: 'player1 placeholder',
            damage: 0,
            participants: 1,
            items: {
                required: [{name:"poo", count:1}],
                gained: [],
                lost: [{name:"poo", count:1}],
            },
            status: {
                hunger: 1,
                thirst: 1
            },
            weight: 1,
            roundValidation: /.*/
        }, 
        {
            text: 'player1 placeholder 2 (electric boogaloo)',
            damage: 10,
            participants: 1,
            items: {
                required: [],
                gained: [{name:"poo", count:2}],
                lost: []
            },
            status: {
                hunger: 0,
                thirst: 0
            },
            weight: 1,
            roundValidation: /.*/
        }, 
    ]
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
    roundActions = [];
    constructor(name, image, game, discord) {
        this.name = name
        this.image = image
        this.discord = discord
        this.gameID = game
    }
    get items() {
        return this.inventory.map(x => {return {name: x.name, count: x.count}})
    }
    newAction(players, round) {
		const data = require('./data.json')
        let game = Game.toGame(JSON.parse(data[this.gameID]))
		const index = game.players.findIndex(obj => obj.discord.id == this.discord.id)
        let legalActions = []
        let THEDEAD = []
        for(let i of Player.ACTIONS) {
            if (i.participants > players) continue
			console.log(2)
            if (!itemsSubset(this.items, i.items.required)) continue
            if (!i.roundValidation.test(game.round)) continue
            legalActions.push(i)    
        }
        let action = legalActions[Math.round(Math.random() * (legalActions.length - 1))]
        let actionText = `${action.text} ${action.items.gained.length ? `+ ${action.items.gained.map(obj => `${obj.count} ${obj.name}(s)`).toString()}`: ''}${action.items.lost.length ? ` | - ${action.items.lost.map(obj => `${obj.count} ${obj.name}(s)`).toString()}`: ''}`
        this.roundActions.push(action)
        legalActions = []
        if(action.participants > 1) {
            let others = []
            for(let i = 0; i < action.participants; i++) {
                others.push(game.players[Math.round(Math.random() * (game.players.length - 1))])
            }
            for (let i of others) {
                if (i.status.health - action.damage == 0) {
                    game.players.splice(game.players[game.players.findIndex(obj => obj.discord.id == i.discord.id)], 1)		
                    THEDEAD.push(i.discord.id)			
                }
                i.status.health -= action.damage
        	    i.status.hunger += action.status.hunger
                i.status.thirst += action.status.thirst
            }    
            this.status.hunger += action.status.hunger
            this.status.thirst += action.status.thirst    
        } else {
			this.status.health -= action.damage
			this.status.hunger += action.status.hunger
			this.status.thirst += action.status.thirst
			if (this.status.health <= 0) {
				this.status.health = 0
                console.log(index)
                console.log(game.players)			
				game.players.splice(index, 1)		
                console.log(game.players)	
                THEDEAD.push(this.discord.id)
                data[this.gameID] = JSON.stringify(game)
                fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data));            
                return [action.text, this.status, JSON.parse(JSON.stringify(this.inventory))]                
			}
		}
        for(let i of action.items.gained) {
            if(this.items.map(x => x.name).includes(i.name)) {
                this.inventory[this.items.map(x => x.name).indexOf(i.name)].count += i.count
            } else {
				this.inventory.push(JSON.parse(JSON.stringify(i)))
            }
        }
        for(let i of action.items.lost) {
            this.inventory[this.items.map(x => x.name).indexOf(i.name)].count -= i.count
            if (this.inventory[this.items.map(x => x.name).indexOf(i.name)].count === 0) {
                this.inventory.splice(this.items.map(x => x.name).indexOf(i.name), 1)
            }
        }
		game.players[index] = Player.toPlayer(JSON.parse(JSON.stringify(this)))
		data[this.gameID] = JSON.stringify(game)
		fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data));            
		return [actionText, this.status, JSON.parse(JSON.stringify(this.inventory)), THEDEAD, this.discord.username, "DEATH!!!!!"]
    }
    //move around the map
    calcMovement() {

    }
	static toPlayer(obj) {
		let result = new Player(obj.name, obj.image, obj.gameID, obj.discord)
		result.inventory = obj.inventory
		result.status = obj.status
		result.district = obj.district
		result.index = obj.index
		result.position = obj.position
        result.roundActions = obj.roundActions
		return result
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

function itemsSubset(a, b) {
    let anames = a.map(x => x.name)
    let bnames = b.map(x => x.name)
    console.log(anames, bnames, a, b)
    const result1 = bnames.every(val => anames.includes(val));
	if(!result1) {
		return false
	}
    const result2 = b.every(val => val.count <= a[anames.indexOf(val.name)].count);
	console.log(result1, result2)
    return result1 && result2
}

module.exports = {
    Game: Game,
    Player: Player
}
