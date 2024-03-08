import {ButtonInteraction, Events, StringSelectMenuInteraction} from 'discord.js';
import {discord_bot} from "../../../index";
import {UpdatePremiereEmbed} from "../shared";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: ButtonInteraction | StringSelectMenuInteraction) {
        if (
            interaction.isStringSelectMenu() || interaction.isButton() &&
            (["premiere_accept", "premiere_deny", "premiere_reminder", "premiere_reset", "premiere_agent_select"].includes(interaction.customId))
        ) {
            const event_id: string | undefined = interaction.message.embeds[0].footer?.text;

            if (event_id) {
                const database = await discord_bot.Client.DB.connect();

                const members = await database.query(`SELECT * FROM members WHERE discord_id = '${interaction.user.id}'`);
                const participation = await database.query(`SELECT * FROM events WHERE event_id = '${event_id}' AND discord_id = '${interaction.user.id}'`);

                // If the member does not exist in the database, they are not part of the team.
                if (members.rows.length <= 0) {
                    return interaction.reply({
                        content: "Du gehörst nicht zum Team.",
                        ephemeral: true
                    })
                }

                if (participation.rows.length <= 0) {
                    await database.query(
                        `INSERT INTO events (event_id, discord_id) VALUES ('${event_id}', '${interaction.user.id}')`
                    )
                }

                let queryStatement: string = "UPDATE events SET ";
                switch (interaction.customId) {
                    case "premiere_accept":
                        queryStatement += `participating = true`
                        break;
                    case "premiere_deny":
                        queryStatement += `participating = false`
                        break;
                    case "premiere_reminder":
                        break;
                    case "premiere_reset":
                        break;
                    case "premiere_agent_select":
                        queryStatement += `primary_agent = '${interaction instanceof StringSelectMenuInteraction ? interaction.values[0] : ""}'`
                        break;
                    default:
                        database.release();
                        return;
                }
                await database.query(queryStatement + ` WHERE event_id = '${event_id}' AND discord_id = '${interaction.user.id}'`);

                database.release();

                await UpdatePremiereEmbed();

                return interaction.reply({
                    content: "Du hast erfolgreich Änderungen an deinem Premiere Status vorgenommen.",
                    ephemeral: true
                })
            }
        }
    },
};