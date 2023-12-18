import { Cache } from "../../utils/globalcache";
import {
    Message, TextChannel
} from "discord.js";
import { discord_bot } from "../../index";

const embed_cache: Cache<Message> = new Cache<Message>();

/* TODO
* Hook MessageDelete Event and check if an embed got manually removed. (Currently, the bot would remove it on every startup because he checks config issues but safety first.
* => Remove it from the database.
*/

export default class EmbedSystem {
    static get_cache(): Cache<Message> {
        return embed_cache;
    }

    /* Loads the rolesystem config from the database. */
    static async load_config() {
        const database = await discord_bot.Client.DB.connect();
        const results = await database.query(`SELECT * FROM embeds`);
        database.release();

        for (const result of results.rows) {
            const channel = await discord_bot.Client.channels.fetch(result.channel_id);

            if (!channel) {
                await this.delete_embed(result.message_id); continue
            }

            try {
                const message = await channel.messages.fetch(result.message_id)
                if (!message) {
                    await this.delete_embed(result.message_id); continue
                }

                embed_cache.set(result.type, message);
                discord_bot.Client.emit(result.type, message);
            } catch (e) {
                await this.delete_embed(result.message_id); continue
            }
        }
    }

    static async add_embed(type: string, message: Message): Promise<void> {
        const database = await discord_bot.Client.DB.connect();
        const value = this.get_cache().get(type);

        if (value) {
            try {
                await this.delete_embed(value.id);
                await value.delete();
            } catch {}
        }

        await database.query(`INSERT INTO embeds (message_id, channel_id, type) VALUES ('${message.id}', '${message.channel.id}', '${type}')`);
        database.release();

        embed_cache.set(type, message);
    }

    static async update_embed(type: string): Promise<void> {
        const message = embed_cache.get(type);

        if (message) {
            discord_bot.Client.emit(type, message);
        }
    }

    static async delete_embed(message_id: string): Promise<void> {
        const database = await discord_bot.Client.DB.connect();

        await database.query(`DELETE FROM embeds WHERE message_id = '${message_id}'`);
        database.release();
    }
}