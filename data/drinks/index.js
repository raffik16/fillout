const beerData = require('./beer.json');
const wineData = require('./wine.json');
const cocktailsData = require('./cocktails.json');
const spiritsData = require('./spirits.json');
const nonAlcoholicData = require('./non-alcoholic.json');

// Combine all drinks into a single array
const allDrinks = [
  ...beerData.drinks,
  ...wineData.drinks,
  ...cocktailsData.drinks,
  ...spiritsData.drinks,
  ...nonAlcoholicData.drinks
];

// Export in the same format as the original drinks.json
module.exports = {
  drinks: allDrinks
};

// Also export individual categories for targeted imports
module.exports.beerData = beerData;
module.exports.wineData = wineData;
module.exports.cocktailsData = cocktailsData;
module.exports.spiritsData = spiritsData;
module.exports.nonAlcoholicData = nonAlcoholicData;