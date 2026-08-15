/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function longPollPaymentStatus(
  paymentId: any,
  {
    baseUrl = 'http://localhost:8000',
    timeout = 25,
    maxTotalTime = 120, // stop after 2 mins
    onUpdate = (data: any) => {},
  } = {}
) {
  const start = Date.now();

  while (true) {
    // stop after maxTotalTime seconds
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > maxTotalTime) {
      return { paymentId, status: 'PENDING', reason: 'client_timeout' };
    }

    try {
      const controller = new AbortController();

      // client-side timeout slightly larger than server timeout
      const clientTimeoutMs = (timeout + 5) * 1000;
      const timer = setTimeout(() => controller.abort(), clientTimeoutMs);

      const res = await fetch(`${baseUrl}/payments/${paymentId}/wait?timeout=${timeout}`, {
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      onUpdate(data);

      if (data.status === 'SUCCESS' || data.status === 'FAILED') {
        return { paymentId, status: data.status, reason: 'terminal' };
      }

      // If timeout or pending: loop again immediately
      // small jitter prevents sync spike
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
    } catch (err) {
      // network error / abort / server error
      console.error('Long poll error:', err);

      // backoff to protect server + client
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
    }
  }
}
