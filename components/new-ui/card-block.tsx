"use client";

import React, { useState, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CardBlockProps {
  title: string;
  cards: string[];
}

/**
 * CardBlock renders a block of text-based educational content.
 * - If multiple cards are provided, it displays a carousel with navigation controls.
 * - If a single card is provided, it simply displays that card without controls.
 */
const CardBlock: React.FC<CardBlockProps> = memo(({ title, cards }) => {
  // Single-card mode: no carousel controls.
  if (cards.length <= 1) {
    return (
      <div className="col-span-5 my-4 px-12">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="px-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {cards[0]}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carousel mode for multiple cards.
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  };

  const prevCard = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="col-span-5 my-4 px-12">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {cards.map((card, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm">{card}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextCard}
            disabled={currentIndex === cards.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

CardBlock.displayName = "CardBlock";

export default CardBlock;