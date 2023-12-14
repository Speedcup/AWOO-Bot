import {SlashCommandBuilder, SlashCommandSubcommandGroupBuilder} from "discord.js";
export { PREMIERE_COMMAND, PREMIERE_MEMBER_COMMAND, WHITELIST };

const WHITELIST = ["406420078549270539"];

const PREMIERE_MEMBER_COMMAND = new SlashCommandSubcommandGroupBuilder()
    .setName("member")
    .setDescription("Verwalte das derzeitige Premiere Roaster.")

const PREMIERE_COMMAND = new SlashCommandBuilder()
    .setName('premiere')
    .setDescription('Premiere-Befehle!')
    .setDefaultMemberPermissions(0)
    // .addSubcommandGroup(PREMIERE_MEMBER_COMMAND);

// const PREMIERE_MEMBER_COMMAND = PREMIERE_COMMAND.addSubcommandGroup(subcommandGroup => subcommandGroup
//     .setName("member")
//     .setDescription("Verwalte das derzeitige Premiere Roaster.")
// )