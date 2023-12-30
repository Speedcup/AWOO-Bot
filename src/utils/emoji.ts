import {Collection, Guild, GuildEmoji, Snowflake} from "discord.js";
import {discord_bot, DiscordBot} from "../index";

// let emoji_cache: Collection<string, GuildEmoji> = new Collection<string, GuildEmoji>();

export default class Emojis {
    // private cache: Collection<string, GuildEmoji>;
    /*
    private client: DiscordBot;

    constructor(client: DiscordBot) {
        this.cache = new Collection();
        this.client = client
    }

    static async fetch_emojis(guild: Guild) {
        if (guild && guild.available) {
            const guild_emojis = await guild.emojis.fetch();

            guild_emojis.forEach(emoji => {
                emoji_cache.set(emoji.name ? emoji.name : emoji.id, emoji)
            })
        }
    }

    static async fetch_emojis_from_devguild(client: any) { // Client has an typeof DiscordBot.Client
        const guild = await client.guilds.fetch("1001550913556729996")
        return this.fetch_emojis(guild)
    }
    */

    static get_emoji(name: string): GuildEmoji {
        const emoji = discord_bot.Client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === name)

        if (emoji) {
            return emoji;
        }

        return discord_bot.Client.emojis.cache.find((emoji: GuildEmoji) => emoji.name?.includes(name))
    }

    static get_emoji_correct(): GuildEmoji {
        return this.get_emoji("correct")
    }
}