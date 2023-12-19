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
    GuildMember, CommandInteractionOptionResolver
} from "discord.js";
import RoleSystem from "../shared";
import EmbedSystem from "../../embed/shared";

module.exports = {
    data: RoleSystem.slashcommand
        .addSubcommand(subcommand => subcommand
            .setName("embed")
            .setDescription("Sende das Rollenverwaltungsembed.")),
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;

        if (options.getSubcommand() == "embed") {
        if (interaction.user.id !== "406420078549270539") {
            return await interaction.reply({
                content: "Keine Berechtigung.",
                ephemeral: true
            })
        }

        const data = await RoleSystem.generate_selection();
        await interaction.reply({
            embeds: [data.embed],
            components: data.components
        });

        /* Embed System Integration */
        const message = await interaction.fetchReply();
        await EmbedSystem.add_embed("rolesystem", message);
    }},
};