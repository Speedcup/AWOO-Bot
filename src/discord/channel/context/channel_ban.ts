import {
    CommandInteraction,
    ContextMenuCommandBuilder,
    ApplicationCommandType
} from "discord.js";
import ChannelManager from "../shared";

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Channel Ban")
        .setType(ApplicationCommandType.User),
    async execute(interaction: CommandInteraction){
        if (!interaction.isUserContextMenuCommand()) return;
        await ChannelManager.ban_user(interaction);
    },
};