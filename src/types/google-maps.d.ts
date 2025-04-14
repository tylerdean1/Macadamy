// Type declarations for custom Google Maps components in JSX

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        center?: string;
        zoom?: string | number;
        'map-id'?: string;
        style?: React.CSSProperties;
      };

      'gmpx-api-loader': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        key?: string;
        'solution-channel'?: string;
      };

      'gmpx-place-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        placeholder?: string;
      };

      'gmp-advanced-marker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: google.maps.LatLngLiteral; // Ensure google.maps is properly referenced
      };
    }
  }
}

export {};
