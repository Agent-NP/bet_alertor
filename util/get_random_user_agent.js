const useragents = require("./useragent-data.json");

const getData = function() {
  return JSON.parse(JSON.stringify(useragents));
};

const getRandomNumberFromMinToMax = function(min, max) {
  //Eg. (getRandomNumberFromMinToMax(1, 10)) Generate a random number between 1 and 9 (inclusive), excluding 10
  return Math.floor(Math.random() * (max - min)) + min;
};

exports.getRandomUserAgent = function() {
  const useragents_data = getData();
  // Getting the useragents length
  const useragents_max_length = Object.keys(useragents_data).length;
  // useragents_max_length is greater than 0
  if (useragents_max_length > 0) {
    const randNumber = getRandomNumberFromMinToMax(0, useragents_max_length);
    return useragents[randNumber];
  } else {
    return null;
  }
};