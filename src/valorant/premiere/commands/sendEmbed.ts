/* Send Premiere Embed */

import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, Embed
} from "discord.js";
import {EMBED_COMMAND} from "../../../commands/shared";
import {VALORANT_Premiere} from "../premiere";

module.exports = {
    data: EMBED_COMMAND.addSubcommand(subcommand => subcommand
        .setName('premiere')
        .setDescription('Sende das Premiere Embed')),
    async execute(interaction: CommandInteraction) {
        const premiere = await new VALORANT_Premiere().fetch_data();
        const events = await premiere.get_events();
        let embeds: EmbedBuilder[] = [];

        /*
        if (events) {
            for (const event of events) {
                embeds.push(
                    new EmbedBuilder()
                        .setTitle(`Premiere ➞ ${event.}`)
                        .setColor(0x3498DB)
                        .setDescription(
                            `Hier kannst du Kanaleinstellungen vornehmen, derzeit kannst du folgendes modifizieren:\n
                        - Maximale Nutzeranzahl, wähle hierzu unten einfach aus dem Dropdown eine gewünschte Anzahl aus.\n
                        - Kanalnamen ändern, du kannst den derzeitigen Kanalnamen beliebig ändern.`)
                        .setTimestamp()
                )
            }
        }
        const message = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Kanaleinstellungen")
                    .setColor(0x3498DB)
                    .setDescription(
                        `Hier kannst du Kanaleinstellungen vornehmen, derzeit kannst du folgendes modifizieren:\n
                        - Maximale Nutzeranzahl, wähle hierzu unten einfach aus dem Dropdown eine gewünschte Anzahl aus.\n
                        - Kanalnamen ändern, du kannst den derzeitigen Kanalnamen beliebig ändern.`)
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>({
                    components: [autochannel_user_select]
                }),
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("channel_name")
                            .setLabel("Kanal-Namen bearbeiten")
                            .setStyle(ButtonStyle.Primary)
                    ]
                })
            ]
        })
        */
    },
};