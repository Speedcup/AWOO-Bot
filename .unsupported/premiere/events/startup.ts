import { UpdatePremiereEmbed } from "../shared";
import {discord_bot} from "../../../index";

module.exports = {
    name: "ready",
    once: true,
    async execute() {
        // TODO, make own file.
        discord_bot.Client.on('interactionCreate', async (interaction: any) => {
            if (interaction.customId && interaction.customId.includes("|")) {
                discord_bot.Client.emit(`${interaction.customId.split("|")[0]}|paginator`, interaction)
            }
        });

        await UpdatePremiereEmbed()
    },
};