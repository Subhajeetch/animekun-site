  const getAnimeId = (title: string, id: number) => {
  
  
  const sanitizedTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Keep only lowercase letters, numbers, spaces, dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes

  const url = `${sanitizedTitle}-${id}`;

  return url;

  }

  export default getAnimeId;