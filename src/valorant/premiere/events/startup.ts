import { UpdatePremiereEmbed } from "../shared";

module.exports = {
    name: "ready",
    once: true,
    async execute() { await UpdatePremiereEmbed(); },
};