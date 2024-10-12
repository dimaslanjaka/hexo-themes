// forked from hexo-theme-butterfly
// do not include this into hexo-theme-butterfly scripts

interface GalleryImageData {
  [key: string]: string;
  url: string;
  caption: string;
}

/**
 * Function to process the content inside the gallery block and return an array of images with captions and URLs.
 * @param content - The content between {% gallery %} and {% endgallery %}
 * @returns An array of objects containing the image URL and caption
 */
function processGalleryContent(content: string): GalleryImageData[] {
  // Split the content by newlines to get individual image markdown
  const imageLines = content.trim().split("\n");

  // Initialize an array to store image data
  const images: GalleryImageData[] = [];

  // Iterate over each image line
  imageLines.forEach((line) => {
    // Extract the caption and URL from the markdown image format ![caption](URL)
    const match = line.match(/!\[([^\]]*)\]\((.*)\)/);
    if (match) {
      const caption = match[1]; // The image caption
      const url = match[2]; // The image URL
      images.push({
        url: url,
        caption: caption || "" // If no caption, set as an empty string
      });
    }
  });

  return images;
}

hexo.extend.tag.register(
  "gallery",
  function (_args: any, content: string) {
    // Call the processGalleryContent function to get image data
    const images = processGalleryContent(content).map((o) => {
      o.alt = o.caption;
      return o;
    });

    // Return the JSON array
    return `<div class="gallery-container"><div class="gallery-items">${JSON.stringify(images, null, 2)}</div></div>`;
  },
  { ends: true }
);

hexo.extend.tag.register("galleryGroup", function (args: string[]) {
  const [name, description, url, imgUrl] = args;

  // Return the required HTML structure
  return `
      <figure class="gallery-group">
        <img class="gallery-group-img" src="${imgUrl}" alt="Group Image Gallery" title="Group Image Gallery" itemprop="image">
        <figcaption>
          <div class="gallery-group-name">${name}</div>
          <p>${description}</p>
          <a href="${url}"></a>
        </figcaption>
      </figure>
    `;
});
