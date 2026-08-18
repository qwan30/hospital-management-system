import { describe, expect, it } from "vitest";
import { getDoctorAvatar, UNSPLASH_DOCTOR_PORTRAITS } from "../doctor-avatars";

describe("doctor-avatars", () => {
  it("exports a non-empty array of valid unsplash photo urls", () => {
    expect(UNSPLASH_DOCTOR_PORTRAITS.length).toBeGreaterThanOrEqual(10);
    for (const url of UNSPLASH_DOCTOR_PORTRAITS) {
      expect(url).toMatch(/^https:\/\/images\.unsplash\.com\//);
    }
  });

  it("returns default avatar when doctor id is empty", () => {
    const avatar = getDoctorAvatar({ id: "" });
    expect(avatar).toBe(UNSPLASH_DOCTOR_PORTRAITS[0]);
  });

  it("returns deterministic avatar URL for the same doctor id", () => {
    const doctorA = { id: "doc-123", fullName: "Dr. Alice" };
    const doctorB = { id: "doc-456", fullName: "Dr. Bob" };

    const avatarA1 = getDoctorAvatar(doctorA);
    const avatarA2 = getDoctorAvatar(doctorA);
    const avatarB = getDoctorAvatar(doctorB);

    expect(avatarA1).toBe(avatarA2);
    expect(UNSPLASH_DOCTOR_PORTRAITS).toContain(avatarA1);
    expect(UNSPLASH_DOCTOR_PORTRAITS).toContain(avatarB);
  });
});
