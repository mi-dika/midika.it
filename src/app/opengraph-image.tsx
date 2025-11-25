import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MiDika — Italian software house';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Orange circle logo */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: '#f97316',
            marginBottom: 40,
          }}
        />
        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            marginBottom: 16,
          }}
        >
          MiDika
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Italian software house
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
