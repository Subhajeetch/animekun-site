declare module "@splidejs/react-splide" {
  import type { ComponentType, HTMLAttributes, ReactNode } from "react";
  import type { Options } from "@splidejs/splide";

  type SplideProps = HTMLAttributes<HTMLDivElement> & {
    options?: Options;
    tag?: "div" | "section" | "header" | "footer" | "nav";
    hasTrack?: boolean;
    children?: ReactNode;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  type SplideSlideProps = HTMLAttributes<HTMLLIElement> & {
    children?: ReactNode;
  };

  export const Splide: ComponentType<SplideProps>;
  export const SplideSlide: ComponentType<SplideSlideProps>;
}

declare module "@splidejs/splide/css";
declare module "@splidejs/react-splide/css";