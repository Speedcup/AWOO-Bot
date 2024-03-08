import { DiscordBot } from "../../../index";
import RoleSystem from "../shared";

module.exports = {
    name: "ready",
    once: true,
    async execute(client: DiscordBot) {
        await RoleSystem.load_config();
    },
};