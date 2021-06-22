import NextHead from "next/head";

const defaultDescription =
  "Platform pembelajaran interaktif pemrograman dan struktur data algoritma.";

function Head({title, description = defaultDescription}) {
  return (
    <NextHead>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
    </NextHead>
  );
}

export default Head;
