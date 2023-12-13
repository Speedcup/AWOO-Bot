import {
    MessageComponentInteraction,
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction, Embed, EmbedBuilder
} from 'discord.js';

class PageSelection {
    readonly pages: EmbedBuilder[];
    private currentPage: number;
    private currentInteraction: CommandInteraction | null;

    public show_previous_button: boolean;
    public show_next_button: boolean;

    constructor(pages: EmbedBuilder[], showPreviousButton: boolean = true, showNextButton: boolean = true) {
        this.pages = pages;
        this.currentPage = 0;
        this.currentInteraction = null;

        this.show_previous_button = showPreviousButton;
        this.show_next_button = showNextButton;
    }

    async create_components() {
        const buttons = new ActionRowBuilder<ButtonBuilder>();

        // Check if we should show the previous button.
        if (this.show_previous_button) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('previous_page')
                    .setLabel('⬅️')
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
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled((this.currentPage + 1) >= this.pages.length)
            )
        }

        return buttons;
    }

    async send(interaction: CommandInteraction) {
        if (!interaction) {
            throw new Error('Invalid Interaction to respond to.');
        }

        const currentPage = this.pages[this.currentPage];
        const buttons = await this.create_components();

        const response = await interaction.reply({ embeds: [currentPage], components: [buttons] });
        this.currentInteraction = interaction;

        const filter = (interaction: MessageComponentInteraction) =>
            interaction.customId === 'previous_page' || interaction.customId === 'next_page';

        const collector = response.createMessageComponentCollector({ filter, time: 30000 });

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

            await this.currentInteraction.editReply({ embeds: [currentPage], components: [components] });
        }
    }
}

export default PageSelection;