import { optimizeImageUrl } from "./image-utils";

export const UNSPLASH_DOCTOR_PORTRAITS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=75", // Female clinician
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=75", // Male clinician
  "https://images.unsplash.com/photo-1594824813570-5882b53bd4c0?auto=format&fit=crop&w=400&q=75", // Female clinician
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=75", // Male clinician
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=75", // Male doctor
  "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=75", // Female doctor
  "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&q=75", // Male doctor
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=75", // Female doctor
  "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=400&q=75", // Male doctor
  "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&q=75", // Female doctor
  "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=400&q=75", // Male doctor
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=75", // Doctor portrait
];

export function getDoctorAvatar(doctor: { id: string; fullName?: string; avatarUrl?: string | null }): string {
  if (doctor.avatarUrl && doctor.avatarUrl.trim()) {
    return optimizeImageUrl(doctor.avatarUrl, { width: 400, quality: 75 }) || doctor.avatarUrl;
  }
  if (!doctor.id) {
    return UNSPLASH_DOCTOR_PORTRAITS[0];
  }
  let hash = 0;
  for (let i = 0; i < doctor.id.length; i++) {
    hash = (hash << 5) - hash + doctor.id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % UNSPLASH_DOCTOR_PORTRAITS.length;
  return UNSPLASH_DOCTOR_PORTRAITS[index];
}
