import {
    MessageComponentInteraction,
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    Embed,
    EmbedBuilder,
    StringSelectMenuBuilder,
    AnyComponentBuilder,
    StringSelectMenuInteraction,
    Message, Component, ActionRow, ButtonComponent, StringSelectMenuComponent
} from 'discord.js';
import {discord_bot} from "../index";
import { v4 as uuidv4 } from 'uuid';
import {type} from "node:os";

class PageSelection {
    private uuid: string;
    private readonly pages: EmbedBuilder[] | Embed[];
    private readonly customComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
    private readonly time: number;
    private currentPage: number;
    private currentInteraction: any;

    public show_previous_button: boolean;
    public show_next_button: boolean;

    constructor(
        pages: EmbedBuilder[],
        customComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [],
        time: number = 30000,
        showPreviousButton: boolean = true,
        showNextButton: boolean = true)
    {
        this.uuid = uuidv4();
        this.pages = pages;

        this.customComponents = customComponents;
        this.time = time;

        this.currentPage = 0;
        this.currentInteraction = null;

        this.show_previous_button = showPreviousButton;
        this.show_next_button = showNextButton;
    }

    static async from_message(uuid: string, interaction: ButtonInteraction): Promise<PageSelection> {
        // Create new actionRows from scratch.
        const message: Message = interaction.message;

        /** Find a way to calculate the current page based of embed ids */

        // for (let i = 0; i >= message.embeds.length; i++) {
        //     if (message.embeds[i].toJSON() === interaction.message.embeds[0].toJSON()) {}
        // }

        const embeds: EmbedBuilder[] = [];
        for (const embed of message.embeds) {
            embeds.push(
                new EmbedBuilder({
                    ...embed.data
                })
            )
        }

        const action_rows: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
        for (const action_row of message.components.slice(0, -1)) {
            const builder = new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>();

            action_row.components.forEach((component: any) => {
                if (component instanceof ButtonComponent) {
                    builder.addComponents(
                        new ButtonBuilder({
                            ...component.data
                        })
                    );
                }
                else if (component instanceof StringSelectMenuComponent)
                {
                    builder.addComponents(
                        new StringSelectMenuBuilder({
                            ...component.data
                        })
                    );
                }
            });

            action_rows.push(builder);
        }

        let pageSelection = new this(embeds, action_rows);
        pageSelection.uuid = uuid;
        pageSelection.currentInteraction = interaction

        return pageSelection;
    }

    async create_components(): Promise<ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]> {
        const buttons = new ActionRowBuilder<ButtonBuilder>();

        // Check if we should show the previous button.
        if (this.show_previous_button) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${this.uuid}|previous_page`)
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.currentPage <= 0)
            )
        }

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`${this.uuid}|current_page`)
                .setLabel(`Page ${this.currentPage + 1} / ${this.pages.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        )

        if (this.show_next_button) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${this.uuid}|next_page`)
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled((this.currentPage + 1) >= this.pages.length)
            )
        }

        return [...this.customComponents, buttons];
    }

    async send(interaction: CommandInteraction) {
        if (!interaction) {
            throw new Error('Invalid Interaction to respond to.');
        }

        const currentPage = this.pages[this.currentPage];
        const buttons = await this.create_components();

        const response = await interaction.reply(
            { embeds: [currentPage], components: buttons }
        );
        this.currentInteraction = interaction;
    }

    private nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
        }
    }

    private previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    private async updateEmbed() {
        if (this.currentInteraction) {
            const currentPage = this.pages[this.currentPage];
            const components = await this.create_components();

            await this.currentInteraction.message.edit({ embeds: [currentPage], components: components });
        }
    }

    async on_button(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        await interaction.deferUpdate();
        switch (interaction.customId.split("|")[1]) {
            case "previous_page":
                this.previousPage();
                break;
            case "next_page":
                this.nextPage();
                break;
            default:
                break;
        }

        await this.updateEmbed();
    }
}

discord_bot.Client.on('interactionCreate', async (interaction: ButtonInteraction) => {
    if (interaction.customId && interaction.customId.includes("|")) {
        const pageSelection = await PageSelection.from_message(interaction.customId.split("|")[0], interaction)
        await pageSelection.on_button(interaction);
    }
});

/* I WAS SOOO GODDAMN STUIPID!!! */
// discord_bot.Client.once('ready', async (client) => {});

export default PageSelection;