package com.hospital.core.prescription;

import com.hospital.core.medicalrecord.MedicalRecordEntity;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

@Service
public class PrescriptionPdfService {
  private static final float PAGE_MARGIN = 50f;
  private static final float LINE_HEIGHT = 18f;
  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final List<String> FONT_CANDIDATES = List.of(
      "C:/Windows/Fonts/arial.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
      "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf");

  public PrescriptionPdfDocument generate(MedicalRecordEntity record) {
    try (var document = new PDDocument();
         var outputStream = new ByteArrayOutputStream()) {
      var page = new PDPage(PDRectangle.A4);
      document.addPage(page);

      var font = loadFont(document);
      var lines = buildLines(record);

      try (var contentStream = new PDPageContentStream(document, page)) {
        contentStream.beginText();
        contentStream.setFont(font, 12);
        contentStream.setLeading(LINE_HEIGHT);
        contentStream.newLineAtOffset(PAGE_MARGIN, page.getMediaBox().getHeight() - PAGE_MARGIN);
        for (var line : lines) {
          contentStream.showText(line);
          contentStream.newLine();
        }
        contentStream.endText();
      }

      document.save(outputStream);
      return new PrescriptionPdfDocument(
          "prescription-" + record.getId() + ".pdf",
          outputStream.toByteArray());
    } catch (IOException exception) {
      throw new IllegalStateException("Unable to generate prescription PDF", exception);
    }
  }

  private PDFont loadFont(PDDocument document) throws IOException {
    for (var candidate : FONT_CANDIDATES) {
      var path = Path.of(candidate);
      if (Files.exists(path)) {
        try (var inputStream = Files.newInputStream(path)) {
          return PDType0Font.load(document, inputStream);
        }
      }
    }
    return new PDType1Font(Standard14Fonts.FontName.HELVETICA);
  }

  private List<String> buildLines(MedicalRecordEntity record) {
    var appointment = record.getAppointment();
    var lines = new ArrayList<String>();
    lines.add("Hospital Management System");
    lines.add("Prescription");
    lines.add("");
    lines.add("Record ID: " + record.getId());
    lines.add("Appointment Date: " + appointment.getAppointmentDate().format(DATE_FORMATTER));
    lines.add("Patient: " + appointment.getPatient().getFullName());
    lines.add("Patient Email: " + appointment.getPatient().getEmail());
    lines.add("Doctor: " + appointment.getDoctor().getFullName());
    lines.add("Diagnosis: " + defaultValue(record.getDiagnosis()));
    lines.add("Clinical Notes: " + defaultValue(record.getClinicalNotes()));
    lines.add("Follow-up Date: " + (record.getFollowUpDate() == null
        ? "Not scheduled"
        : record.getFollowUpDate().format(DATE_FORMATTER)));
    lines.add("");
    lines.add("Prescription Items:");
    if (record.getPrescriptionItems().isEmpty()) {
      lines.add("- No medicines prescribed");
    } else {
      for (var item : record.getPrescriptionItems()) {
        lines.add("- " + item.getMedicineName() + " | " + item.getDosage());
        if (item.getFrequency() != null && !item.getFrequency().isBlank()) {
          lines.add("  Frequency: " + item.getFrequency());
        }
        if (item.getDurationDays() != null) {
          lines.add("  Duration: " + item.getDurationDays() + " days");
        }
        if (item.getInstructions() != null && !item.getInstructions().isBlank()) {
          lines.add("  Instructions: " + item.getInstructions());
        }
      }
    }
    return lines;
  }

  private String defaultValue(String value) {
    return value == null || value.isBlank() ? "N/A" : value;
  }
}
