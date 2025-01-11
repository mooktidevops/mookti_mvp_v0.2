'use client';

import { PlusCircle, X } from 'lucide-react';
import { useState } from 'react';

import { RichTextEditor } from '@/components/custom/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardCarouselContent } from '@/lib/types/displayType';

interface CardCarouselInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface Card {
  title: string;
  content: string;
}

export function CardCarouselInput({ value, onChange }: CardCarouselInputProps) {
  // Parse initial value or use default structure
  const initialContent: CardCarouselContent = value ? 
    JSON.parse(value) : 
    {
      heading: '',
      cards: [
        { title: '', content: '' },
        { title: '', content: '' }
      ]
    };

  const [heading, setHeading] = useState(initialContent.heading || '');
  const [cards, setCards] = useState<Card[]>(initialContent.cards);

  const updateContent = (newHeading: string, newCards: Card[]) => {
    const content: CardCarouselContent = {
      heading: newHeading,
      cards: newCards
    };
    onChange(JSON.stringify(content));
  };

  const handleHeadingChange = (newHeading: string) => {
    setHeading(newHeading);
    updateContent(newHeading, cards);
  };

  const handleCardChange = (index: number, field: keyof Card, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
    updateContent(heading, newCards);
  };

  const addCard = () => {
    const newCards = [...cards, { title: '', content: '' }];
    setCards(newCards);
    updateContent(heading, newCards);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 2) return; // Maintain minimum of 2 cards
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    updateContent(heading, newCards);
  };

  return (
    <div className="space-y-4">
      {/* Optional Heading */}
      <div className="space-y-2">
        <Label>Carousel Heading (Optional)</Label>
        <Input
          placeholder="Enter carousel heading"
          value={heading}
          onChange={(e) => handleHeadingChange(e.target.value)}
        />
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <Label>Cards</Label>
        {cards.map((card, index) => (
          <div key={index} className="relative p-4 border rounded-lg space-y-3">
            {/* Delete button */}
            {cards.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeCard(index)}
              >
                <X className="size-4" />
              </Button>
            )}

            {/* Card Title */}
            <div className="space-y-2">
              <Label>Card Title</Label>
              <Input
                placeholder="Enter card title"
                value={card.title}
                onChange={(e) => handleCardChange(index, 'title', e.target.value)}
              />
            </div>

            {/* Card Content */}
            <div className="space-y-2">
              <Label>Card Content</Label>
              <RichTextEditor
                content={card.content}
                onChange={(value) => handleCardChange(index, 'content', value)}
                placeholder="Enter card content..."
              />
            </div>
          </div>
        ))}

        {/* Add Card Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addCard}
        >
          <PlusCircle className="size-4 mr-2" />
          Add Card
        </Button>
      </div>
    </div>
  );
} 