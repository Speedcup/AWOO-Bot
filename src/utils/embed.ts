import * as DC from 'discord.js';
import {EmbedData, APIEmbed, ColorResolvable} from "discord.js";

export default class EmbedBuilder extends DC.EmbedBuilder {
    constructor(data?: EmbedData | APIEmbed) {
        super(data);

        if (!data?.color) {
            this.setColor('#FA4454');
        }

        if (!data?.thumbnail) {
            this.setThumbnail('https://cdn.discordapp.com/avatars/1071500471304474735/91505fbb40ab45c2b8b49ffa12ed821f.png?size=1024'); // Standard-Thumbnail-URL
        }
    }

    public setSubTitle(subTitle: String | null) {
        this.setTitle(`» ${this.data.title} — ${subTitle}`);
        return this;
    }
}