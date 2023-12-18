/* Send Channel Management Embed */

import {
    CommandInteraction,
    SlashCommandBuilder,
    CommandInteractionOptionResolver, Role
} from "discord.js";
import RoleSystem from "../shared";
import EmbedSystem from "../../embed/shared";

module.exports = {
    data: RoleSystem.slashcommand
        .addSubcommand(subcommand => subcommand
            .setName("add")
            .setDescription("Füge eine Custom Rolle hinzu.")
            .addRoleOption(
                option => option
                .setName("role")
                .setDescription("Die Rolle, welche hinzugefügt werden soll.")
                .setRequired(true)
            )
            .addStringOption(
                option => option
                    .setName("emoji")
                    .setDescription("Das Emoji welche die Rolle repräsentiert. (Optional)")
                    .setRequired(false)
            ),
        ),
    async execute(interaction: CommandInteraction) {
        console.log(interaction.commandName);
        if (interaction.user.id !== "406420078549270539") {
            return await interaction.reply({
                content: "Keine Berechtigung.",
                ephemeral: true
            })
        }

        const options = interaction.options as CommandInteractionOptionResolver;
        const role = <Role>options.getRole(
            "role",
            true
        )!;
        const emoji = options.getString("emoji");

        if (RoleSystem.get_cache().get(role.id)) {
            return await interaction.reply({
                content: "Diese Rolle existiert bereits im System.",
                ephemeral: true
            })
        }

        await RoleSystem.add_role(role, emoji ? emoji : "");
        await EmbedSystem.update_embed("rolesystem");
    },
};