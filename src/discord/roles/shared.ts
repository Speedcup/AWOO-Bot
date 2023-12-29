import { Cache } from "../../utils/globalcache";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Embed,
    EmbedBuilder,
    GuildEmoji,
    GuildMember,
    Role, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
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
    public static slashcommand = new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Role Commands')

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

    static async add_role(role: Role, emoji_id: GuildEmoji | string = "0"): Promise<void> {
        if (emoji_id instanceof GuildEmoji) {
            emoji_id = emoji_id.id;
        }

        if (emoji_id.startsWith("<") && emoji_id.endsWith(">")) {
            let emojiString = emoji_id.slice(1, -1);
            let splittedString = emojiString.split(":");
            emoji_id = splittedString[splittedString.length - 1];
        }

        const database = await discord_bot.Client.DB.connect();
        const results = await database.query(`SELECT * FROM roles WHERE id = '${role.id}'`);

        if (results.rows.length > 0) {
            database.release();
            return await this.edit_role(role, emoji_id);
        }

        await database.query(`INSERT INTO roles (id, emoji_id) VALUES ('${role.id}', '${emoji_id}')`);
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

    static async generate_selection(): Promise<{
        components: (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[];
        embed: EmbedBuilder
    }> { // member: GuildMember
        /*
        // Old System with buttons.
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
        */
        const emoji_trash = discord_bot.Client.emojis.cache.get("1184888993259724810");
        const star_emoji = discord_bot.Client.emojis.cache.get("1186289987348598784");
        const magicwand_emoji = discord_bot.Client.emojis.cache.get("1186303818527424583");

        const options: StringSelectMenuOptionBuilder[] = []
        for (const [key, data] of this.get_cache()) {
            if (data.emoji) {
                options.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(data.role.name)
                        .setValue(data.role.id)
                        .setEmoji(data.emoji.id)
                )
            } else {
                options.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(data.role.name)
                        .setValue(data.role.id)
                )
            }
        }

        return {
            embed:
                new EmbedBuilder()
                    .setTitle(`【${star_emoji}】━━━━━━━━▶ Rollen System ◀━━━━━━━━【${star_emoji}】`)
                    .setDescription(
                        "> **Was ist das Rollensystem?**\n" +
                        "↬ Das System gibt dir die Möglichkeit aus dem Dropdown verschiedene Spiele auszuwählen, welche du derzeit aktiv spielst.\n" +
                        "↬ Das System soll verhindern, dass der Discord überladen wirkt und du auch wirklich nur das siehst, was dich interessiert.\n\n" +
                        "> **Was bringt mir das?**\n" +
                        "↬ Du erhältst Benachrichtigung bezüglich der Spielersuche.\n" +
                        "↬ Du erhältst Zugriff auf die für das Spiel vorgesehenen Bereiche.\n" +
                        "↬ Andere Mitglieder sehen, dass du das Spiel auch spielst.\n\n" +
                        "> **Ich möchte ein Spiel entfernen**\n" +
                        "↬ Wähle die Rolle einfach erneut aus oder drücke auf Zurücksetzen um alle Spiele wieder zu entfernen.\n\n" +
                        "> **Ich habe eine Rolle ausgewählt, und sehe trotzdem nichts neues?**\n" +
                        "↬ Es ist Möglich, dass das Spiel nur als eine Symbolisierung für andere Mitglieder fungiert, da noch kein Bedarf an einem eigenen Bereich besteht.\n" +
                        "↬ Bei Bedarf werden weitere Bereiche für bestimmte Spiele eingerichtet."
                    )
                    // .setFooter({
                    //     text: "Wenn du eine Rolle entfernen möchtest, wähle die Rolle einfach erneut aus oder drücke auf Zurücksetzen um alle vergebenen Rollen zu entfernen."
                    // })
                    .setThumbnail(discord_bot.Client.users.cache.get(discord_bot.Client.application.id)?.avatarURL()),
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Alle Hinzufügen")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(magicwand_emoji.id)
                            .setCustomId("role_selection_all"),

                        new ButtonBuilder()
                            .setLabel("Zurücksetzen")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(emoji_trash.id)
                            .setCustomId("role_selection_reset"),
                ),
                new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setPlaceholder("Wähle eine Rolle ...")
                            .setCustomId("role_selection")
                            .addOptions(options)
                    )
            ]
        }
    }
}