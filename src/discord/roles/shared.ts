import { Cache } from "../../utils/globalcache";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Embed,
    EmbedBuilder,
    GuildEmoji,
    GuildMember,
    Role
} from "discord.js";
import { discord_bot } from "../../index";

/* IDEA / TODO
*   Maybe not save the role as referencce, so we cache it every time we are using it, so we have the most recent updated value.
*   We would interact with a
*/
type CustomRole = {
    id: string,
    role: Role,
    emoji: GuildEmoji,
    // get_role: () => void,
}
const role_cache: Cache<CustomRole> = new Cache<CustomRole>();

export default class RoleSystem {
    static get_cache(): Cache<CustomRole> {
        return role_cache;
    }

    /* Loads the rolesystem config from the database. */
    static async load_config() {
        const database = await discord_bot.Client.DB.connect();
        const results = await database.query(`SELECT * FROM roles`);
        database.release();

        /* VANGUARD is a private discord bot, so we only save roles from this guild.
        * We could improve this by saving the guild id to the role id. */
        const guild = await discord_bot.Client.guilds.fetch("1134978383336456323");
        for (const result of results.rows) {
            const role: Role | null = await guild.roles.fetch(result.id);

            if (role) {
                role_cache.set(
                    role.id, {
                        id: String(role.id),
                        role: await guild.roles.fetch(role.id),
                        emoji: discord_bot.Client.emojis.cache.get(result.emoji_id),
                    }
                )
            }
        }
    }

    static async add_role(role: Role, emoji_id: GuildEmoji | string): Promise<void> {
        if (emoji_id instanceof GuildEmoji) {
            emoji_id = emoji_id.id;
        }

        const database = await discord_bot.Client.DB.connect();
        const results = await database.query(`SELECT * FROM roles WHERE id = '${role.id}'`);

        if (results.rows.length > 0) {
            database.release();
            return await this.edit_role(role, emoji_id);
        }

        await database.query(`INSERT INTO roles ('id', 'emoji_id') VALUES ('${role.id}', '${emoji_id}')`);
        database.release();
    }

    static async edit_role(role: Role, emoji_id: GuildEmoji | string): Promise<void> {
        if (emoji_id instanceof GuildEmoji) {
            emoji_id = emoji_id.id;
        }

        const database = await discord_bot.Client.DB.connect();
        const results = await database.query(`SELECT * FROM roles WHERE id = '${role.id}'`);

        if (results.rows.length <= 0) {
            database.release();
            return await this.add_role(role, emoji_id);
        }

        await database.query(`UPDATE roles SET emoji_id = '${emoji_id}' WHERE id = '${role.id}'`);
        database.release();
    }

    static async remove_role(role: Role): Promise<void> {
        const database = await discord_bot.Client.DB.connect();

        await database.query(`DELETE FROM roles WHERE id = '${role.id}'`);
        database.release();
    }

    static async generate_selection(member: GuildMember): Promise<{embed: EmbedBuilder, components: ActionRowBuilder<ButtonBuilder>}> { // member: GuildMember
        const components: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();

        for (const [key, data] of this.get_cache()) {
            components.addComponents(
                new ButtonBuilder()
                    .setLabel(data.role.name)
                    .setStyle(member.roles.cache.has(data.role.id) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setEmoji(data.emoji ? data.emoji.id : "")
                    .setCustomId(`role_selection_${data.role.id}`)
            )
        }

        return {
            embed:
                new EmbedBuilder()
                    .setTitle("Rollenverwaltung")
                    .setDescription(
                        "Hier kannst du deine eigenen Rollen verwalten.\n" + "Blau = Ausgewählt | Grau = Abgewählt"
                    )
                    .setThumbnail(member.displayAvatarURL()),
            components: components
        }
    }
}