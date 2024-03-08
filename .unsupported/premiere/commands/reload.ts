/* Reload premiere embed */

import { CommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandSubcommandBuilder, User } from "discord.js";
import { UpdatePremiereEmbed } from "../shared";

module.exports = {
    command: new SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands'),
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("reload")
        .setDescription("Lädt das Premiere Embed neu."),
    can_execute: (user: User | GuildMember) => {
        return [
            "406420078549270539",   // SPEEDCUP
            "660816130721579021",   // GILGAMESH
            "205077419139399682",   // ILLUMIC
            "303958067249414156",   // PHIL
            "861992984441782343",   // SELINA
            "202243988806303744",   // WANTED
            "353211541178548226"    // NICKLAS
        ].includes(user.id);
    },
    async execute(interaction: CommandInteraction) {
        await UpdatePremiereEmbed()
        await interaction.reply({
            content: "Done!",
            ephemeral: true
        })
    },
};