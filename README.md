# AWOO Discord Bot

AWOO is a simple and lightweight Discord bot written in TypeScript, designed to help manage channels, greet users, and provide a few outdated features that were used to organize Valorant Premiere schedules. It's a hobby project and serves a basic set of features for keeping your server clean and organized. 

## Features

### 1. **Channel Manager**
The Channel Manager is the core feature of AWOO, helping server owners maintain and manage their channels with ease. It includes:

- **Channel Creation**: Allows users to create channels dynamically.
- **Channel Maintenance**: Automatically handles the upkeep of channels, removing unused ones to keep the server tidy.
- **Channel Deletion**: Deletes inactive channels.
- **Channel Access Restrictions**: Allows channel owners to limit access, making sure only certain members can join.
- **Channel Modification**: Users can modify their own channels, like changing the name, user limit, or other settings.

### 2. **Welcome/Leave Messages**
AWOO sends customizable messages when a user joins or leaves the server. This keeps the community informed and provides a personal touch to your server.

- **Welcome Messages**: Sent automatically when a new user joins the server.
- **Leave Messages**: Sent automatically when a user leaves the server.

### 3. **Old Valorant Premiere System (Deprecated)**
This was an old system used by me and my team to manage our Valorant Premiere schedule. You could manage:

- **Time Schedule**: Set up schedules and organize matches.
- **Agent Selection**: Check who could play on specific days and with what agent.

⚠️ **This system no longer works** due to changes in Henrik's API, which now requires an API key and has a different response format. The feature is outdated, but if you want to revive or fix it, feel free to do so! The code is still there, along with some images of the old system. Be warned: Discord.js is **not** a friendly library for dynamic modular systems, and it was quite painful to build, especially the paginator system!

### 4. **Small Cache System (Deprecated)**
This caching system was designed for the Valorant Premiere feature, used to cache Valorant API data and reduce repetitive requests. Since the Premiere system no longer works, this feature is also no longer required.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/awoo-discord-bot.git
   ```
2. **Install dependencies**:
   ```bash
   cd awoo-discord-bot
   npm install
   ```
3. **Set up environment variables**:
   - You need to create a `.env` file and add the required Discord bot token.
   ```bash
   DISCORD_TOKEN=your-discord-token-here
   ```
4. **Run the bot**:
   ```bash
   npm run start
   ```

## How to Use

1. **Channel Manager**: Users can create and manage their own channels using commands in the bot.
2. **Welcome/Leave Messages**: Automatically triggered when users join or leave the server.
3. **Valorant Premiere System**: Outdated, but you can explore the code if you'd like to try and fix it.

## Contributions

Feel free to contribute to AWOO! If you'd like to fix or improve the bot, just open a pull request. Particularly if you're up for the challenge of reviving the Valorant Premiere system, go for it. I no longer maintain this feature.

## License

This project is licensed under the MIT License. 

## Final Thoughts

AWOO is a personal project that was designed with simplicity in mind, but over time, it accumulated some experimental features (like the Valorant system) that I no longer use. The bot is lightweight and useful for managing Discord servers, but you're welcome to add your own features or improve what's here.

Happy coding! 🐺
