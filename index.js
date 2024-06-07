//Import neccessary libraries
const axios = require("axios");
const { faker } = require("@faker-js/faker");
const cheerio = require("cheerio");

//Configuring enviromental variable
require("dotenv").config();

//Import variables
const request_timeout = "50000";
const bot_token = process.env.BOT_TOKEN;
const bot_id = process.env.BOT_ID;
let root_url = `https://api.telegram.org/bot${bot_token}`;
let matches = [];

const sendMessage = async (chat_id, text_message) => {
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

// Function to send a message to multiple chat IDs
async function sendMessages(text_message) {
  const chat_id_1 = process.env.CHAT_ID_1;
  const chat_id_2 = process.env.CHAT_ID_2;
  const chat_id_3 = process.env.CHAT_ID_3;
  const chat_ids = [chat_id_1, chat_id_2, chat_id_3];
  for (const chat_id of chat_ids) {
      if (bot_id && chat_id && chat_id != bot_id) {
        console.log(chat_id);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await sendMessage(chat_id, text_message);
      }
    }
}

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

async function getMatches(url) {
  try {
    console.log("Loading Url: ", url);

    const randomIP = getRandomIP();
    const params = {
      headers: {
        "X-Forwarded-For": randomIP,
        "User-Agent": getRandomUserAgent().userAgent
      }
    };

    // Make a request to the target URL
    const response = await axios.get(url, {
      headers: params.headers,
      timeout: request_timeout
    });

    //Get the html content
    const html = response.data;

    //Load the html into cheerio
    const $ = cheerio.load(html);

    // Extract matches with any percentage 70 or above
    $("tbody tr").each((index, element) => {
      const homeTeam = $(element).find("td:nth-child(3)").text().trim();
      const awayTeam = $(element).find("td:nth-child(4)").text().trim();
      const percentages = $(element)
        .find("td")
        .slice(4, 7)
        .map((i, el) => parseInt($(el).text().trim()))
        .get();

      percentages.forEach((percent, i) => {
        if (percent >= 70) {
          matches.push({
            homeTeam,
            awayTeam,
            percent,
            team: i === 0 ? homeTeam : i === 1 ? "Draw" : awayTeam
          });
        }
      });
    });

    console.log("Matches with 70% or above:", matches);
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const message = `${match.homeTeam} vs ${match.awayTeam} - ${match.percent}% (${match.team})`;
      console.log(message);
      (async () => {
        await sendMessages(message);
      })();
    }
    console.log("Messent Sent!");

    const nextLink = $('a[rel="next"]').attr("href");
    if (nextLink) {
      await getMatches(nextLink);
    } else {
      console.log("No more pages to scrape.");
    }
  } catch (error) {
    console.error("Error scraping data:", error);
    getMatches(url);
  }
}

const getScheduledMatches = async (year, month, day) => {
  //Checking if the date is not valid to set the date to current date
  if (!isValidDate(year, month, day)) {
    const date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }
  let matchDate = new Date(year, month, day);

  let correctingMonth =
    matchDate.getMonth() < 10
      ? `0${matchDate.getMonth()}`
      : matchDate.getMonth();

  let correctingDay =
    matchDate.getDate() < 10 ? `0${matchDate.getDate()}` : matchDate.getDate();

  const scheduledMatchesUrl = `https://www.your1x2.com/football/1x2-Matches/${matchDate.getFullYear()}-${correctingMonth}-${correctingDay}/`;
  getMatches(scheduledMatchesUrl);
  console.log("Done for the day!");
};

//Codes


// getScheduledMatches();

// sendMessages("Welcome to Chibest Bet Alertor");
function scheduleTask(callback) {
    // Function to execute the task
    function executeTask() {
        // Execute the callback function
        callback();
    }

    // Set interval to run every 24 hours
    function setDailyInterval() {
        setInterval(executeTask, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    }

    // Get the current time
    const now = new Date();
    
    // Calculate the time until 11:59 PM
    const timeUntilMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23, // Hours (11 PM)
        59, // Minutes
        0 // Seconds
    ) - now;

    // If it's already past 11:59 PM, execute the task immediately
    if (timeUntilMidnight <= 0) {
        executeTask();
        // Set interval to start 24 hours later
        setDailyInterval();
    } else {
        // Otherwise, wait until 11:59 PM to execute the task for the first time
        setTimeout(() => {
            executeTask();
            // Set interval to start 24 hours later
            setDailyInterval();
        }, timeUntilMidnight);
    }
}

// Call the function to schedule the task
scheduleTask(getScheduledMatches);
