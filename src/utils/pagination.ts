import {
    MessageComponentInteraction,
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction, EmbedBuilder, StringSelectMenuBuilder, MessageInteraction, Message
} from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import {discord_bot} from "../index";

class PageSelection {
    private uuid: string;
    private readonly pages: EmbedBuilder[];
    private readonly customComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
    private readonly time: number;
    private currentPage: number;

    private interaction: ButtonInteraction | undefined;
    private message: Message | undefined;

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

        this.show_previous_button = showPreviousButton;
        this.show_next_button = showNextButton;

        /* TODO, create an independent event system.
        *   Use discord.Client.on(Symbol("unique_symbol"))
        *   Use discord.Client.emit(Symbol("unique_symbol"))
        *   Fix - Currently the pageselection system does not reuse themselve, so it creates new events over and over again.
        */
        discord_bot.Client.on('interactionCreate', async (interaction: any) => {
            return await this.callback(interaction, this);
        });
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

        // if (!interaction.deferred) {
        //     await interaction.deferReply()
        // }

        const response = await interaction.reply(
            {
                embeds: [currentPage],
                components: buttons,
            }
        );

        this.message = await interaction.fetchReply();
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

    private async updateEmbed(interaction: ButtonInteraction | undefined) {
        if (interaction) {
            const currentPage = this.pages[this.currentPage];
            const components = await this.create_components();

            try {
                await interaction.editReply({embeds: [currentPage], components: components});
            } catch {}
        }

        if (this.message && !interaction) {
            const currentPage = this.pages[this.currentPage];
            const components = await this.create_components();

            await this.message.edit({ embeds: [currentPage], components: components });
        }
    }

    async edit(message: Message | undefined = undefined) {
        if (message) {
            this.message = message;
        }

        if (this.message) {
            const currentPage = this.pages[this.currentPage];
            const components = await this.create_components();

            await this.message.edit({
                embeds: [currentPage],
                components: components,
            })
        }
    }
    /*
    // => Something I just copy n pasted from the old solution where I was trying to recreate pageselections based of their interaction message.
    static async from_message(uuid: string, interaction: ButtonInteraction): Promise<PageSelection> {
        // Create new actionRows from scratch.
        const message: Message = interaction.message;

         // Find a way to calculate the current page based of embed ids
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
    */

    async callback(interaction: ButtonInteraction, pageSelection: PageSelection) {
        if (interaction.customId && interaction.customId.includes("|")) {
            try {
                await interaction.deferUpdate();
            } catch (e) {}

            switch (interaction.customId.split("|")[1]) {
                case "previous_page":
                    pageSelection.previousPage();
                    break;
                case "next_page":
                    pageSelection.nextPage();
                    break;
                default:
                    break;
            }

            await pageSelection.updateEmbed(interaction);
        }
    }
}

export default PageSelection;