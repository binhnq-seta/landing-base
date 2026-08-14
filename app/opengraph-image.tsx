import { ImageResponse } from 'next/og'

export const alt = 'General Systems – Kết nối công nghệ, kiến tạo hạ tầng tương lai'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          color: 'white',
          background: 'linear-gradient(135deg, #071b35 0%, #173e6c 62%, #b3262b 135%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              background: '#ef3438',
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            GS
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>GENERAL SYSTEMS</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              maxWidth: 960,
              display: 'flex',
              flexDirection: 'column',
              fontSize: 64,
              lineHeight: 1.08,
              fontWeight: 800,
            }}
          >
            <span>Kết nối công nghệ.</span>
            <span>Kiến tạo hạ tầng tương lai.</span>
          </div>
          <div style={{ fontSize: 25, color: '#c9dcf5' }}>
            Technology Integration · Cybersecurity · Digital Infrastructure
          </div>
        </div>
      </div>
    ),
    size,
  )
}
