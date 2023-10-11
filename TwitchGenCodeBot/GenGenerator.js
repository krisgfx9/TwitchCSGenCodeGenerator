const axios = require('axios');
const readline = require('readline');
const WebSocket = require('ws');
const { Client, GatewayIntentBits } = require('discord.js');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const oAuth = "YOUR_DISCORD_AUTH_TOKEN"; // Replace with your Twitch OAuth token
const channel = "YOUR_TWITCH_CHANNEL_NAME"; // Replace with your Twitch channel name
const discordToken = 'YOUR_DISCORD_BOT_TOKEN'; // Replace with your Discord bot token
const discordChannelId = 'YOUR_DISCORD_CHANNEL_ID'; // Replace with your Discord channel ID

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,          // Required for server information
    GatewayIntentBits.GuildMessages,   // Required for reading messages
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(discordToken);

// Initialize WebSocket connection to Twitch chat
const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

socket.addEventListener('open', () => {
  socket.send(`PASS oauth:${oAuth}`);
  socket.send(`NICK InspectBot`);
  socket.send(`JOIN #${channel}`);
});

socket.addEventListener('message', async (event) => {
  const message = event.data;

  // Log the message received from Twitch chat
  console.log(`Twitch Chat: ${message}`);

  const match = message.match(/steam:\/\/rungame\/730\/([^ ]+)/);

  if (match) {
    const sender = message.match(/:([^!]+)/)[1]; // Extract the sender's name
    const matchedPart = match[1];

    // Now, you can also log the matchedPart which should contain the URL.
    console.log(`Received URL from Twitch chat: steam://rungame/730/${matchedPart}`);

    // Pass the URL to the gen code function
    const genCode = await fetchItemInfoAndGenerateCode(`http://inspects.krisgfx.ch/?url=steam://rungame/730/${matchedPart}`);
    console.log("Generated Code:", genCode);

    // Send the generated code along with the sender's name to the specified Discord channel
    const discordChannel = await client.channels.fetch(discordChannelId);
    discordChannel.send(`${sender}:  ${genCode}`);
  } else {
    // Handles non-URL messages here.
  }
});

// Create an HTTPS agent that ignores SSL certificate errors
const agent = new https.Agent({
  rejectUnauthorized: false, // This option disables certificate verification
});

async function fetchItemInfoAndGenerateCode(url) {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent, // Pass the agent to ignore SSL errors
    });

    if (response.status === 200) {
      const itemInfo = response.data.iteminfo;
      return generateCode(itemInfo);
    } else {
      console.error('Failed to fetch item information.');
      return 'Failed to fetch item information.';
    }
  } catch (error) {
    console.error('Error:', error.message);
    return 'Error: ' + error.message;
  }
}

function generateCode(itemInfo) {
  const {
    defindex,
    paintindex,
    paintseed,
    floatvalue,
    stickers,
    weapon_type,
  } = itemInfo;

  // Check if the weapon_type is "Gloves" or "Wraps"
  if (weapon_type && (weapon_type.includes("Gloves") || weapon_type.includes("Wraps"))) {
    return `!gengl ${defindex} ${paintindex} ${paintseed} ${floatvalue}`;
  }

  const maxStickerSlots = 4; // All non-Gloves/Wraps must have 4 sticker slots thanks REMIX
  const stickerText = new Array(maxStickerSlots).fill('0 0');

  if (stickers && stickers.length > 0) {
    stickers.forEach((sticker) => {
      const { stickerId, slot } = sticker;
      stickerText[slot] = `${stickerId} ${sticker.wear || 0}`;
    });
  }

  return `!gen ${defindex} ${paintindex} ${paintseed} ${floatvalue} ${stickerText.join(' ')}`;
}

rl.question('Enter the Steam URL after /?url= : ', (userProvidedUrl) => {
  rl.close();

  if (!userProvidedUrl) {
    console.error('Please provide a Steam URL.');
    process.exit(1);
  }

  const url = 'http://inspects.krisgfx.ch/?url=' + userProvidedUrl;
  const port = process.env.PORT || 8104; // Use the PORT environment variable or 3000 as a default

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  async function fetchItemInfoAndGenerateCode(url) {
    try {
      const response = await axios.get(url, {
        httpsAgent: agent, // Pass the agent to ignore SSL errors
      });

      if (response.status === 200) {
        const itemInfo = response.data.iteminfo;
        const generatedCode = generateCode(itemInfo);
        console.log(generatedCode);
      } else {
        console.error('Failed to fetch item information.');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  function generateCode(itemInfo) {
    const {
      defindex,
      paintindex,
      paintseed,
      floatvalue,
      stickers,
      weapon_type
    } = itemInfo;

    // Checks if the weapon_type is "Gloves" or "Wraps"
    if (weapon_type && (weapon_type.includes("Gloves") || weapon_type.includes("Wraps"))) {
      return `!gengl ${defindex} ${paintindex} ${paintseed} ${floatvalue}`;
    }

    const maxStickerSlots = 4; // tells that it must have 4 stickers
    const stickerText = new Array(maxStickerSlots).fill('0 0');

    if (stickers && stickers.length > 0) {
      stickers.forEach((sticker) => {
        const { stickerId, slot } = sticker;
        stickerText[slot] = `${stickerId} ${sticker.wear || 0}`;
      });
    }

    return `!gen ${defindex} ${paintindex} ${paintseed} ${floatvalue} ${stickerText.join(' ')}`;
  }

  fetchItemInfoAndGenerateCode(url);
});
