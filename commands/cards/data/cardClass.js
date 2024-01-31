class Card {
    constructor(name, rarity, pack, quality = null) {
        this.name = name;
        this.rarity = rarity;
        this.pack = pack;
        this.quality = quality ?? Math.round(gaussianRandom(this.rarity/2, 5/3) * 10) / 10
        if (this.quality > 5) this.quality = 5
        if (this.quality < 0.1) this.quality = 0.1
    }

    static Cardify (o) {
        return new Card(o.name, o.rarity, o.pack, o.quality ?? null)
    }

    static Setify (o) {
        return new CardSet(o.name, [o.quality], o.pack, o.rarity)
    }
}

class CardSet {
    constructor(name, qualities, pack, rarity, count = 1) {
        this.name = name;
        this.pack = pack
        this.rarity = rarity
        this.qualities = qualities;
        this.count = count;
    }

    static Setify(o) {
        console.log(o)
        return new CardSet(o.name, o.qualities, o.pack, o.rarity, o.count)
    }

    static Cardify(o, i) {
        return new Card(o.name, o.rarity, o.pack, o.qualities[i])
    }

    add(c) {
        this.count += 1
        this.qualities.push(c.quality)
    }
}
module.exports = { Card, CardSet }
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}
