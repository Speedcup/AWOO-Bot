/* Send Channel Management Embed */

import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, SlashCommandBuilder
} from "discord.js";

module.exports = {
    enabled: false,
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Channel Commands')
        .addSubcommand(subcommand => subcommand
            .setName("embed")
            .setDescription("Sende das Kanalverwaltungsembed.")),
    async execute(interaction: CommandInteraction) {
        let select_options: StringSelectMenuOptionBuilder[] = [];

        for (let i = 0; i < 21; i++) {
            select_options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(String(i))
                    .setValue(String(i))
            )
        }

        const autochannel_user_select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("autochannel_user")
            .setPlaceholder("Maximale Nutzer (0 = Unendlich) ...")
            .addOptions(select_options);

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
    },
};