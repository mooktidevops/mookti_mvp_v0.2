export enum DisplayType {
  message = 'message',
  card = 'card',
  card_carousel = 'card_carousel'
}

export interface CardCarouselContent {
  heading?: string;
  cards: Array<{
    title: string;
    content: string;
  }>;
} 