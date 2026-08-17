import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingWidget } from "../booking-widget";
import * as publicApi from "@/lib/public-api";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("BookingWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(publicApi, "listDepartments").mockResolvedValue([
      { id: "dept-cardio", name: "Cardiology", description: "Heart care", headDoctorId: "doc-1", isActive: true },
      { id: "dept-neuro", name: "Neurology", description: "Brain care", headDoctorId: "doc-2", isActive: true },
    ]);
    vi.spyOn(publicApi, "listDoctors").mockResolvedValue([
      {
        id: "doc-1",
        fullName: "Dr. James Wilson",
        email: "james@hospital.vn",
        departmentId: "dept-cardio",
        departmentName: "Cardiology",
        specialty: "Interventional Cardiology",
        qualification: "MD, FACC",
        phone: "+84 90 123 4567",
        active: true,
      },
      {
        id: "doc-2",
        fullName: "Dr. Sarah Chen",
        email: "sarah@hospital.vn",
        departmentId: "dept-neuro",
        departmentName: "Neurology",
        specialty: "Clinical Neurology",
        qualification: "MD, PhD",
        phone: "+84 90 765 4321",
        active: true,
      },
    ]);
  });

  it("renders interactive department and doctor options and navigates with params", async () => {
    const user = userEvent.setup({ delay: null });
    render(<BookingWidget />);

    expect(screen.getByRole("heading", { name: /Fast-track clinical intake/i })).toBeInTheDocument();

    // Wait for departments to load
    const deptSelect = await screen.findByLabelText(/Department/i);
    expect(await screen.findByRole("option", { name: "Cardiology" })).toBeInTheDocument();

    // Select Cardiology
    await user.selectOptions(deptSelect, "dept-cardio");

    // Doctor dropdown should only show Dr. James Wilson
    const docSelect = screen.getByLabelText(/Doctor/i);
    expect(screen.getByRole("option", { name: /Dr\. James Wilson/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Dr\. Sarah Chen/i })).not.toBeInTheDocument();

    await user.selectOptions(docSelect, "doc-1");

    // Click Book Appointment button
    const bookButton = screen.getByRole("button", { name: /Book Appointment/i });
    await user.click(bookButton);

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("/booking?doctorId=doc-1&departmentId=dept-cardio"),
    );
  });
});
