//*** Generic rules ***
// each day quality & sellby value decrease by 1 for all items
// quality can never be 0 or higher than 50
// if sellBy < 0, quality decrease rate = 2

// *** Aged Brie rules ***
// Instead of decreasing in quality each day, it increases

// ***  Sulfuras ***
// Never decreases in quality or has a sellBy time

// *** Backstage passes ***
// Instead of decreasing in quality each day, it increases
// if sellBy < 10, quality increase rate + 2
// if sellBy < 5, quality increase rate + 3
// if sellBy = 0, quality increase rate = 0

// ***  Conjured ***
// Quality decrease by 2

export class Item {
  name: string;
  sellIn: number;
  quality: number;

  constructor(name, sellIn, quality) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

type rules = {
  name: string;
  qualityRate: number;
  sellByRate: number;
};
const DEFAULT_RATE: number = -1;

const rulesList: Array<rules> = [
  { name: "Aged Brie", qualityRate: 1, sellByRate: DEFAULT_RATE },
  { name: "Sulfuras, Hand of Ragnaros", qualityRate: 0, sellByRate: 0 },
  {
    name: "Backstage passes to a TAFKAL80ETC concert",
    qualityRate: 1,
    sellByRate: DEFAULT_RATE,
  },
  { name: "Conjured Mana Cake", qualityRate: -2, sellByRate: DEFAULT_RATE },
];

const MIN_QUALITY: number = 0;
const MAX_QUALITY: number = 50;

export class GildedRose {
  items: Array<Item>;
  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  calculateQuality(
    name: string,
    sellInXDays: number,
    quality: number,
    qualityRate: number
  ) {
    let rate = qualityRate;

    //check backstage pass rules
    if (name.includes("Backstage passes")) {
      switch (true) {
        case sellInXDays === 0:
          // if sellBy = 0, quality increase rate = 0
          return 0;
        case sellInXDays < 5:
          // if sellBy < 5, quality increase rate + 3
          return quality + 3;
        case sellInXDays < 10:
          // if sellBy < 10, quality increase rate + 2
          return quality + 2;
        default:
          // Instead of decreasing in quality each day, it increases
          // defaults to 1
          return quality + qualityRate;
      }
    }

    // if sellBy < 0, quality decreases twice as fast
    if (sellInXDays === 0) rate = qualityRate * 2;
    if (sellInXDays < 0) rate = qualityRate * 2 * Math.abs(sellInXDays);

    //quality can't be less than 0
    return quality + rate <= 0 ? 0 : quality + rate;
  }

  updateQuality() {
    const items: Array<Item> = this.items;

    //loop through items each day
    for (let i = 0; i < items.length; i++) {
      //set readable names
      const currentItem = items[i];
      const name = currentItem.name;
      let quality = currentItem.quality;
      let sellInXDays = currentItem.sellIn;

      //check for special rules
      const rules: rules | undefined = rulesList.find((rule) =>
        rule.name.includes(name)
      );

      let sellByRate: number = rules ? rules?.sellByRate : DEFAULT_RATE;
      let qualityRate: number = rules ? rules?.qualityRate : DEFAULT_RATE;

      const newQuality = this.calculateQuality(
        name,
        sellInXDays,
        quality,
        qualityRate
      );

      currentItem.quality =
        quality > MIN_QUALITY && quality < MAX_QUALITY ? newQuality : quality;

      currentItem.sellIn = sellInXDays + sellByRate;
    }
    return items;
  }
}
