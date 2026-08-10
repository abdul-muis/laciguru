// Utility to manage client device fingerprinting

export function getOrCreateDeviceId(): string {
  const STORAGE_KEY = 'laci_guru_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    const randomBytes = Math.random().toString(36).substring(2, 11);
    const timestamp = Date.now().toString(36);
    deviceId = `DEV-${timestamp}-${randomBytes}`.toUpperCase();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}

export function getDeviceFriendlyName(): string {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'OS';

  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'Mac';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} (${os})`;
}
