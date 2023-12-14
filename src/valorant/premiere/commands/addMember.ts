/* Send Premiere Embed */

import {
    CommandInteraction,
} from "discord.js";
import {PREMIERE_COMMAND, PREMIERE_MEMBER_COMMAND, WHITELIST} from "../shared";
import {discord_bot} from "../../../index";

module.exports = {
    data: PREMIERE_COMMAND.addSubcommandGroup(PREMIERE_MEMBER_COMMAND).addSubcommand(subcommand => subcommand
        .setName('add')
        .setDescription('Füge ein Mitglied zum Roaster hinzu.')
        .addUserOption(option =>
            option.setName('user').setDescription('Das Mitglied, das hinzugefügt werden soll').setRequired(true)
        )
        .addBooleanOption(option => option
            .setName("bench")
            .setDescription("Ist der Spieler ein Auswechselspieler? (Bench Player)")
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