/* Send Channel Management Embed */

import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    GuildMember
} from "discord.js";
import RoleSystem from "../shared";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Role Commands')
        .addSubcommand(subcommand => subcommand
            .setName("embed")
            .setDescription("Sende das Rollenverwaltungsembed.")),
    async execute(interaction: CommandInteraction) {
        if (interaction.user.id !== "406420078549270539") {
            return await interaction.reply({
                content: "Keine Berechtigung.",
                ephemeral: true
            })
        }

        const data = await RoleSystem.generate_selection(interaction.member as GuildMember);
        return await interaction.reply({
            embeds: [data.embed],
            components: data.components
        });
    },
};