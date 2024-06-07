//Import neccessary libraries
const axios = require("axios");
const { faker } = require("@faker-js/faker");
const cheerio = require("cheerio");

//Import variables
const request_timeout = "50000";
const bot_token = process.env.BOT_TOKEN;
const chat_id = process.env.CHAT_ID;
let root_url = `https://api.telegram.org/bot${bot_token}`;

const sendMessage = async text_message => {
  let deliveryMan = `${root_url}/sendMessage?chat_id=${chat_id}&text=${text_message}`;
  await axios
    .get(deliveryMan)
    .then(() => {
      console.log("Message Sent!");
    })
    .catch(error => {
      console.log(error);
    });
};

function getRandomIP() {
  return faker.internet.ip();
}

function isValidDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

const { getRandomUserAgent } = require("./util/get_random_user_agent");

const getScheduledMatches = async (year, month, day) => {
  //Checking if the date is not valid to set the date to current date
  if (!isValidDate(year, month, day)) {
    const date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }
  let matchDate = new Date(year, month, day);
  const randomIP = getRandomIP();
  const params = {
    headers: {
      "X-Forwarded-For": randomIP,
      "User-Agent": getRandomUserAgent().userAgent
    }
  };
  let correctingMonth =
    matchDate.getMonth() + 1 < 10
      ? `0${matchDate.getMonth() + 1}`
      : matchDate.getMonth() + 1;
  const scheduledMatchesUrl = `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${matchDate.getFullYear()}-${correctingMonth}-${matchDate.getDate()}`;
  // console.log(scheduledMatchesUrl);
  const response = await axios.get(scheduledMatchesUrl, {
    headers: params.headers,
    timeout: request_timeout
  });

  //Codes

  console.log("Done for the day!");
};

getScheduledMatches(2024, 3, 17);
