import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Row, Column,
} from '@react-email/components'

interface Event {
  title: string
  councilName: string
  venue?: string | null
  startAt: Date
  bookingUrl?: string | null
  category?: string | null
}

interface Props {
  events: Event[]
  councilNames: string[]
  unsubscribeUrl: string
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function WeeklyDigest({ events, councilNames, unsubscribeUrl }: Props) {
  const preview = `${events.length} upcoming events in ${councilNames.slice(0, 2).join(', ')}${councilNames.length > 2 ? ' and more' : ''}`

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: '32px auto', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#1e3a5f', padding: '28px 32px' }}>
            <Heading style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>
              🗓 Your Weekly Events
            </Heading>
            <Text style={{ color: '#93c5fd', margin: '4px 0 0', fontSize: 13 }}>
              {councilNames.join(' · ')}
            </Text>
          </Section>

          {/* Events */}
          <Section style={{ padding: '24px 32px' }}>
            {events.length === 0 ? (
              <Text style={{ color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>
                No upcoming events this week for your councils.
              </Text>
            ) : (
              events.map((e, i) => (
                <Row key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < events.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <Column style={{ width: 56, verticalAlign: 'top' }}>
                    <div style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                      <Text style={{ color: '#60a5fa', margin: 0, fontSize: 10, fontWeight: 600 }}>
                        {formatDate(e.startAt).split(' ')[0].toUpperCase()}
                      </Text>
                      <Text style={{ color: '#1d4ed8', margin: 0, fontSize: 18, fontWeight: 700, lineHeight: '1' }}>
                        {formatDate(e.startAt).split(' ')[1]}
                      </Text>
                      <Text style={{ color: '#3b82f6', margin: 0, fontSize: 10 }}>
                        {formatDate(e.startAt).split(' ')[2]}
                      </Text>
                    </div>
                  </Column>
                  <Column style={{ paddingLeft: 12, verticalAlign: 'top' }}>
                    <Text style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{e.title}</Text>
                    <Text style={{ margin: '2px 0 0', color: '#64748b', fontSize: 12 }}>
                      {e.councilName}{e.venue ? ` · ${e.venue}` : ''}
                    </Text>
                    {e.category && (
                      <Text style={{ margin: '4px 0 0', display: 'inline-block', backgroundColor: '#fef3c7', color: '#92400e', fontSize: 11, padding: '1px 8px', borderRadius: 99 }}>
                        {e.category}
                      </Text>
                    )}
                    {e.bookingUrl && (
                      <Button href={e.bookingUrl} style={{ marginTop: 6, backgroundColor: '#1e3a5f', color: '#fff', borderRadius: 6, fontSize: 11, padding: '4px 12px', display: 'inline-block' }}>
                        Book now →
                      </Button>
                    )}
                  </Column>
                </Row>
              ))
            )}
          </Section>

          <Hr style={{ borderColor: '#f1f5f9', margin: 0 }} />

          {/* Footer */}
          <Section style={{ padding: '16px 32px', backgroundColor: '#f8fafc' }}>
            <Text style={{ color: '#94a3b8', fontSize: 11, margin: 0, textAlign: 'center' }}>
              Melbourne Council Explorer · You&apos;re receiving this because you subscribed.{' '}
              <a href={unsubscribeUrl} style={{ color: '#94a3b8' }}>Unsubscribe</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
