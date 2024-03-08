import {discord_bot, DiscordBot} from "../../../index";
import {Client, Guild, Role, VoiceChannel} from "discord.js";

module.exports = {
    name: "ready",
    once: true,
    async execute(client: Client) {
        const database = await discord_bot.Client.DB.connect();
        const results = await database.query(`SELECT * FROM channels`);

        if (results.rowCount > 0) {
            for (const result of results.rows) {
                await client.channels.fetch(result.channel_id)
                    .then(async channel => {
                        if (channel instanceof VoiceChannel) {
                            if (channel?.members.size <= 0) {
                                await channel.delete()
                                    .catch(console.error);
                                await database.query(`DELETE FROM channels WHERE channel_id = '${channel.id}'`)
                            }
                        }
                    })
                    .catch(console.error);
            }
        }

        database.release();
    },
};