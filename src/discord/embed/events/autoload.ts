import { DiscordBot } from "../../../index";
import EmbedSystem from "../shared";

module.exports = {
    name: "ready",
    once: true,
    async execute(client: DiscordBot) {
        await EmbedSystem.load_config();
    },
};