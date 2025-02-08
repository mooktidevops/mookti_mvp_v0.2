import React from "react";

export interface MultimediaBlockProps {
  title: string;
  src: string;
  mediaType: "image" | "video";
  alt?: string;
}

/**
 * MultimediaBlock is a prototype for displaying multimedia content.
 * Depending on the `mediaType` prop, it renders either an image or a video.
 */
const MultimediaBlock: React.FC<MultimediaBlockProps> = ({
  title,
  src,
  mediaType,
  alt,
}) => {
  return (
    <div className="col-span-5 my-4 px-12">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex justify-center">
          {mediaType === "video" ? (
            <video controls className="max-w-full rounded-lg" src={src} />
          ) : (
            <img src={src} alt={alt || title} className="max-w-full rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MultimediaBlock;