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
    GuildMember, CommandInteractionOptionResolver, SlashCommandSubcommandBuilder, User
} from "discord.js";
import RoleSystem from "../shared";
import EmbedSystem from "../../embed/shared";
import {IsSPEEDCUP} from "../../shared";

module.exports = {
    command: RoleSystem.slashcommand,
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("embed")
        .setDescription("Sende das Rollenverwaltungsembed."),
    can_execute: (user: User | GuildMember) => {
        return IsSPEEDCUP(user);
    },
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