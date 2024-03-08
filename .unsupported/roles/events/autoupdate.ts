import { DiscordBot } from "../../../index";
import EmbedSystem from "../shared";
import RoleSystem from "../shared";
import {GuildMember, Message} from "discord.js";

module.exports = {
    name: "rolesystem",
    async execute(message: Message) {
        await RoleSystem.load_config();

        const data = await RoleSystem.generate_selection();

        /* Embed System Integration */
        await message.edit({
            embeds: [data.embed],
            components: data.components
        });
    },
};