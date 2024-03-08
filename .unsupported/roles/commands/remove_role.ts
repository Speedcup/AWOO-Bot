/* Send Channel Management Embed */

import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver, Role, SlashCommandSubcommandBuilder, User, GuildMember
} from "discord.js";
import RoleSystem from "../shared";
import EmbedSystem from "../../embed/shared";
import {IsSPEEDCUP} from "../../shared";

module.exports = {
    command: RoleSystem.slashcommand,
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Entferne eine Custom Rolle.")
        .addRoleOption(
            option => option
                .setName("role")
                .setDescription("Die Rolle, welche entfernt werden soll.")
                .setRequired(true)
        ),
    can_execute: (user: User | GuildMember) => {
        return IsSPEEDCUP(user);
    },
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const role = <Role>options.getRole(
            "role",
            true
        )!;
        await RoleSystem.remove_role(role)

        await EmbedSystem.update_embed("rolesystem");

        await interaction.reply({
            content: `Die Rolle ${role} wurde erfolgreich entfernt.`,
            ephemeral: true
        })
    },
};