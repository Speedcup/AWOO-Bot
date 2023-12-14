import {
    MessageComponentInteraction,
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction, Embed, EmbedBuilder, StringSelectMenuBuilder, AnyComponentBuilder
} from 'discord.js';

class PageSelection {
    private readonly pages: EmbedBuilder[];
    private readonly customComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
    private readonly time: number;
    private currentPage: number;
    private currentInteraction: CommandInteraction | null;

    public show_previous_button: boolean;
    public show_next_button: boolean;

    constructor(
        pages: EmbedBuilder[],
        customComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [],
        time: number = 30000,
        showPreviousButton: boolean = true,
        showNextButton: boolean = true)
    {
        this.pages = pages;

        this.customComponents = customComponents;
        this.time = time;

        this.currentPage = 0;
        this.currentInteraction = null;

        this.show_previous_button = showPreviousButton;
        this.show_next_button = showNextButton;
    }

    async create_components(): Promise<ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]> {
        const buttons = new ActionRowBuilder<ButtonBuilder>();

        // Check if we should show the previous button.
        if (this.show_previous_button) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('previous_page')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.currentPage <= 0)
            )
        }

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId('current_page')
                .setLabel(`Page ${this.currentPage + 1} / ${this.pages.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        )

        if (this.show_next_button) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('next_page')
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

        const filter = (interaction: MessageComponentInteraction) =>
            interaction.customId === 'previous_page' || interaction.customId === 'next_page';

        const collector = response.createMessageComponentCollector({ filter, time: this.time });

        collector.on('collect', async (interaction: ButtonInteraction) => {
            await interaction.deferUpdate();
            if (interaction.customId === 'previous_page') {
                this.previousPage();
            } else if (interaction.customId === 'next_page') {
                this.nextPage();
            }
            await this.updateEmbed();
        });

        collector.on('end', () => {
            if (this.currentInteraction) {
                this.currentInteraction.editReply({ components: [] }).catch(console.error);
            }
        });
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

            await this.currentInteraction.editReply({ embeds: [currentPage], components: components });
        }
    }
}

export default PageSelection;