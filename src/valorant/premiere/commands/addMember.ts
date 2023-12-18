/* Send Premiere Embed */

import {
    CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import {WHITELIST} from "../shared";
import {discord_bot} from "../../../index";

// TODO, add member remove option.
module.exports = {
    data: new SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands')
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('member')
                .setDescription('Manage the current Premiere Roaster.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('add')
                        .setDescription('Add a member to the Roaster.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setDescription('The member to be added.')
                                .setRequired(true)
                        )
                        .addBooleanOption(option =>
                            option
                                .setName('bench')
                                .setDescription('Is the player a Bench Player?')
                        )
                )
        ),
    async execute(interaction: CommandInteraction) {
        if (!WHITELIST.includes(interaction.user.id)) return;

        const client = await discord_bot.Client.DB.connect();
        const result = await client.query(`SELECT discord_id FROM members WHERE discord_id = '${interaction.options.getUser('user')?.id}'`);
        console.log(interaction.options.get("bench"));

        if (result.rowCount == 0) {
            await client.query(`INSERT INTO members (discord_id, valorant_uuid, valpaw_uuid) VALUES ('${interaction.options.getUser('user')?.id}', null, null)`);

            await interaction.reply({
                content: `${interaction.options.getUser('user')} erfolgreich dem Team hinzugefügt!`,
                ephemeral: true
            })
        } else {
            await interaction.reply({
                content: `${interaction.options.getUser('user')} ist bereits Mitglied des Teams.`,
                ephemeral: true
            })
        }

        client.release();
    },
};