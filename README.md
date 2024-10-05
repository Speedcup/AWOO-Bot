# AWOO Discord Bot

AWOO is a simple and lightweight Discord bot written in TypeScript, designed to help manage channels, greet users, and provide a few outdated features that were used to organize Valorant Premiere schedules. It's a hobby project and serves a basic set of features for keeping your server clean and organized. 

## ✨ Features

### 1. **Channel Manager**
The Channel Manager is the core feature of AWOO, helping server owners maintain and manage their channels with ease. It includes:

- **Channel Creation**: Allows users to create channels dynamically.
- **Channel Maintenance**: Automatically handles the upkeep of channels, removing unused ones to keep the server tidy.
- **Channel Deletion**: Deletes inactive channels.
- **Channel Access Restrictions**: Allows channel owners to limit access, making sure only certain members can join.
- **Channel Modification**: Users can modify their own channels, like changing the name, user limit, or other settings.

The backend of this feature uses a PostgreSQL database to store some information. You'll need to specify your database connection details in the `.env` file, which will be explained in the installation section of this README.

### 2. **Welcome/Leave Messages**
AWOO sends customizable messages when a user joins or leaves the server. This keeps the community informed and provides a personal touch to your server.

- **Welcome Messages**: Sent automatically when a new user joins the server.
- **Leave Messages**: Sent automatically when a user leaves the server.

### 3. **Old Valorant Premiere System (Deprecated)**
This was an old system used by me and my team to manage our Valorant Premiere schedule. You could manage:

- **Upcoming Matches**: See upcoming premiere matches.
- **Time Schedule**: Set up schedules and organize matches.
- **Agent Selection**: Check who could play on specific days and with what agent.

⚠️ **This system no longer works** due to changes in Henrik's API, which now requires an API key and has a different response format. The feature is outdated, but if you want to revive or fix it, feel free to do so! The code is still there, along with some images of the old system. Be warned: Discord.js is **not** a friendly library for dynamic modular systems, and it was quite painful to build, especially the paginator system!

![Premiere Embed](/assets/premiere_embed.png)
![Premiere Embed2](/assets/premiere_embed_2.png)

### Emoji Explanations

- ⏰ **Clock Emoji**: This player has not yet set whether they will play or not.
- ✅ **Checkmark**: This player has time and confirmed they will play in this match.
- ❌ **Cross**: This player has opted out of this match and cannot play.
- ↔️ **Two Arrows Left and Right**: This player is benched, acting as a fallback when the main roster needs someone else to fill a missing spot.

### 4. **Outdated Role Manager (Deprecated)**
AWOO also offers an outdated role manager, allowing users to select roles they want to have—similar to Discord's current onboarding feature. This was created before Discord introduced the official onboarding system, which now performs this function more effectively. As a result, the role manager has been removed and is no longer being maintained.

![Role Embed](/assets/roles.png)

### 5. **Small Cache System (Deprecated)**
This caching system was designed for the Valorant Premiere feature, used to cache Valorant API data and reduce repetitive requests. Since the Premiere system no longer works, this feature is also no longer required.

## 🔨 Installation

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
   - You need to create a `.env` file and add the required Discord bot token & database information.
   ```bash
   TOKEN=
   DATABASE_USER=
   DATABASE_HOST=
   DATABASE_DB=
   DATABASE_PASSWORD=
   ```
4. **Run the bot**:
   ```bash
   npm run start
   ```

## ❓ How to Use

You'll probably need to dive into the code to fully understand how everything works. Here’s a basic overview to get you started:

### Channel Manager
1. **Create a Channel for Custom Channel Creation**:
   - First, create a "creation channel" where users will join to create their own custom channels.
   - Then, update the ID of this channel in the code:
     - Go to `/src/discord/channel/shared.ts` and on **line 39**, set the channel ID to the one you’ve created.
     - Also, make sure to change the **member ID** in this function to your bot's ID.

2. **Creating Multiple Creation Channels** (Optional):
   - If you want to create multiple "creation channels", you can do so by adjusting the `can_create_channel` function in the code. Modify it to suit your needs, allowing flexibility in channel creation.
   - Typically, user-created channels are organized under a **Base Channel Category** (which users need to join). If no category is provided, the bot will create channels without one.

### Configuration for Other Features
- You’ll need to manually replace the static **Discord Snowflake IDs** (like channel IDs for logging, etc.) with your own in the relevant parts of the code.
- Errors may occur when starting the bot if these IDs are not updated, but once they’re set correctly, everything should run smoothly.

For everything else, explore the codebase and follow the comments. This will guide you through customizing the bot to your needs. After setting up the necessary values, the bot should be ready to go!

## 🔧 Contributions

Feel free to contribute to AWOO! If you'd like to fix or improve the bot, just open a pull request. Particularly if you're up for the challenge of reviving the Valorant Premiere system, go for it. I no longer maintain this feature.

## License

This project is licensed under the MIT License. 

## Final Thoughts

AWOO is a personal project that was designed with simplicity in mind, but over time, it accumulated some experimental features (like the Valorant system) that I no longer use. The bot is lightweight and useful for managing Discord servers, but you're welcome to add your own features or improve what's here.

Happy coding! 🐺
