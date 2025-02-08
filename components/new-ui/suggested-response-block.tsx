import React from 'react';

export interface SuggestedResponse {
  id: string;
  text: string;
}

export interface SuggestedResponseBlockProps {
  suggestedResponses: SuggestedResponse[];
  onSuggestionClick: (suggestion: SuggestedResponse) => void;
}

/**
 * SuggestedResponseBlock renders a set of suggested response buttons.
 * When a button is clicked, it calls the onSuggestionClick handler with the selected suggestion.
 */
const SuggestedResponseBlock: React.FC<SuggestedResponseBlockProps> = ({
  suggestedResponses,
  onSuggestionClick,
}) => {
  return (
    <div className="flex flex-wrap justify-end gap-2 mb-4">
      {suggestedResponses.map((response) => (
        <button
          key={response.id}
          onClick={() => onSuggestionClick(response)}
          className="px-4 py-2 border border-blue-500 rounded-full text-sm hover:bg-blue-500 hover:text-white transition-all"
        >
          {response.text}
        </button>
      ))}
    </div>
  );
};

export default SuggestedResponseBlock;