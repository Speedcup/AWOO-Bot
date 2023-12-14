import {
    ActionRowBuilder,
    Events, ModalBuilder, TextInputBuilder, TextInputStyle
} from 'discord.js';
import {channel_cache} from "../../utils/globalcache";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {
        if (
            interaction.isStringSelectMenu() || interaction.isButton() &&
            (["premiere_accept", "premiere_deny", "premiere_reminder", "premiere_reset", "premiere_agent_select"].includes(interaction.customId))
        ) {}
    },
};