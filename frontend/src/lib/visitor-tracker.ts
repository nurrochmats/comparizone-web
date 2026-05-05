export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let id = localStorage.getItem('visitor_id');

  if (!id) {
    // Generate a simple UUID-like string without dependencies
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('visitor_id', id);
  }

  return id;
}

export async function trackEvent(eventType: string, metadata: Record<string, any> = {}, eventName?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        visitor_id: getVisitorId(),
        event_type: eventType,
        event_name: eventName,
        metadata: metadata
      })
    });
  } catch (err) {
    console.error('Failed to track event:', err);
  }
}
