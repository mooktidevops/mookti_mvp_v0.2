'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CardCarouselContent } from '@/lib/types/displayType';

interface CardCarouselProps {
  content: CardCarouselContent;
}

export function CardCarousel({ content }: CardCarouselProps) {
  return (
    <div className="w-full max-w-4xl">
      <h3 className="text-lg font-semibold mb-4">{content.heading}</h3>
      <Carousel className="w-full">
        <CarouselContent>
          {content.cards.map((card, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{card.content}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
} 