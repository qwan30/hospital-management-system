package com.hospital.api;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.prescription.PrescriptionItemEntity;
import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for inventory management endpoints:
 * - GET    /api/v1/inventory/items
 * - POST   /api/v1/inventory/items
 * - PUT    /api/v1/inventory/items/{itemId}
 * - DELETE /api/v1/inventory/items/{itemId}
 * - GET    /api/v1/inventory/lots
 * - POST   /api/v1/inventory/lots
 * - PUT    /api/v1/inventory/lots/{lotId}
 * - GET    /api/v1/inventory/movements
 * - POST   /api/v1/inventory/movements
 * - GET    /api/v1/inventory/alerts
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InventoryIntegrationTest extends AbstractIntegrationTest {
  @Autowired
  private MedicalRecordRepository medicalRecordRepository;

  // ── Items ─────────────────────────────────────────────────────────────

  @Test
  void listItemsRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/items"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void listItemsReturnsSeededItems() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
  }

  @Test
  void createItemSucceeds() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "sku": "TEST-ITEM-001",
                  "itemName": "Test Bandage Roll",
                  "category": "Consumable",
                  "unit": "roll",
                  "reorderLevel": 20,
                  "quantityOnHand": 100,
                  "departmentId": "%s"
                }
                """.formatted(deptId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.sku").value("TEST-ITEM-001"))
        .andExpect(jsonPath("$.data.itemName").value("Test Bandage Roll"));
  }

  @Test
  void createItemFailsWithMissingSku() throws Exception {
    mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "itemName": "No SKU Item",
                  "category": "Test",
                  "unit": "pcs",
                  "reorderLevel": 10
                }
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void updateItemSucceeds() throws Exception {
    var items = inventoryItemRepository.findAll();
    if (!items.isEmpty()) {
      var itemId = items.get(0).getId();

      mockMvc.perform(put("/api/v1/inventory/items/{itemId}", itemId)
              .header("Authorization", "Bearer " + adminToken())
              .contentType("application/json")
              .content("""
                  {
                    "itemName": "%s (Updated)",
                    "category": "%s",
                    "unit": "%s",
                    "reorderLevel": 25
                  }
                  """.formatted(items.get(0).getItemName(), items.get(0).getCategory(),
                  items.get(0).getUnit())))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.data.reorderLevel").value(25));
    }
  }

  @Test
  void deleteItemReturnsNoContent() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    var createResult = mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "sku": "DEL-TEST-001",
                  "itemName": "Item to Delete",
                  "category": "Equipment",
                  "unit": "unit",
                  "reorderLevel": 5,
                  "quantityOnHand": 10,
                  "departmentId": "%s"
                }
                """.formatted(deptId)))
        .andExpect(status().isCreated())
        .andReturn();

    var itemId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("itemId").asText();

    mockMvc.perform(delete("/api/v1/inventory/items/{itemId}", itemId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isNoContent());
  }

  // ── Lots ──────────────────────────────────────────────────────────────

  @Test
  void listLotsReturnsSeededLots() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/lots")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
  }

  @Test
  void createLotSucceeds() throws Exception {
    var items = inventoryItemRepository.findAll();
    if (!items.isEmpty()) {
      mockMvc.perform(post("/api/v1/inventory/lots")
              .header("Authorization", "Bearer " + adminToken())
              .contentType("application/json")
              .content("""
                  {
                    "itemId": "%s",
                    "lotCode": "LOT-TEST-001",
                    "supplierName": "Test Supplier",
                    "quantityReceived": 50,
                    "expiresOn": "2027-12-31"
                  }
                  """.formatted(items.get(0).getId())))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.data.lotCode").value("LOT-TEST-001"));
    }
  }

  // ── Movements ─────────────────────────────────────────────────────────

  @Test
  void listMovementsReturnsSeededMovements() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/movements")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
  }

  @Test
  void recordMovementSucceeds() throws Exception {
    var items = inventoryItemRepository.findAll();
    if (!items.isEmpty()) {
      mockMvc.perform(post("/api/v1/inventory/movements")
              .header("Authorization", "Bearer " + adminToken())
              .contentType("application/json")
              .content("""
                  {
                    "itemId": "%s",
                    "movementType": "RESTOCK",
                    "quantityDelta": 20,
                    "note": "Test restock movement"
                  }
                  """.formatted(items.get(0).getId())))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.data.movementType").value("RESTOCK"));
    }
  }

  // ── Alerts ────────────────────────────────────────────────────────────

  @Test
  void pharmacistDispensesMedicationAgainstPrescriptionLotAndAuditTrail() throws Exception {
    var lot = inventoryLotRepository.findAll().stream()
        .filter(candidate -> candidate.getQuantityRemaining() > 0
            && candidate.getItem().getQuantityOnHand() > 0)
        .findFirst()
        .orElseThrow();
    var item = lot.getItem();
    var originalItemQuantity = item.getQuantityOnHand();
    var originalLotQuantity = lot.getQuantityRemaining();
    var doctorId = doctorOneId();
    var slot = createSlot(doctorId, LocalDate.now().plusDays(3), LocalTime.of(11, 0));
    var appointmentJson = createAppointment(doctorId.toString(), slot.getId().toString());
    var appointmentId = UUID.fromString(appointmentJson.get("data").get("id").asText());
    var appointment = appointmentRepository.findById(appointmentId).orElseThrow();
    appointment.setStatus(AppointmentStatus.DONE);
    appointmentRepository.save(appointment);

    var savedRecord = medicalRecordRepository.save(prescriptionRecord(appointment, item.getItemName()));

    mockMvc.perform(post("/api/v1/inventory/dispense")
            .header("Authorization", "Bearer " + pharmacistToken())
            .contentType("application/json")
            .content("""
                {
                  "itemId": "%s",
                  "lotId": "%s",
                  "medicalRecordId": "%s",
                  "prescriptionItemName": "%s",
                  "quantity": 1,
                  "note": "Pharmacist pickup verification"
                }
                """.formatted(item.getId(), lot.getId(), savedRecord.getId(), item.getItemName())))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.itemId").value(item.getId().toString()))
        .andExpect(jsonPath("$.data.lotId").value(lot.getId().toString()))
        .andExpect(jsonPath("$.data.medicalRecordId").value(savedRecord.getId().toString()))
        .andExpect(jsonPath("$.data.prescriptionItemName").value(item.getItemName()))
        .andExpect(jsonPath("$.data.quantityDispensed").value(1))
        .andExpect(jsonPath("$.data.itemQuantityOnHand").value(originalItemQuantity - 1))
        .andExpect(jsonPath("$.data.lotQuantityRemaining").value(originalLotQuantity - 1));
  }

  @Test
  void dispenseRejectsPrescriptionMismatch() throws Exception {
    var lot = inventoryLotRepository.findAll().stream()
        .filter(candidate -> candidate.getQuantityRemaining() > 0)
        .findFirst()
        .orElseThrow();
    var doctorId = doctorOneId();
    var slot = createSlot(doctorId, LocalDate.now().plusDays(4), LocalTime.of(11, 30));
    var appointmentJson = createAppointment(doctorId.toString(), slot.getId().toString());
    var appointmentId = UUID.fromString(appointmentJson.get("data").get("id").asText());
    var appointment = appointmentRepository.findById(appointmentId).orElseThrow();
    appointment.setStatus(AppointmentStatus.DONE);
    appointmentRepository.save(appointment);

    var savedRecord = medicalRecordRepository.save(prescriptionRecord(appointment, "Different medication"));

    mockMvc.perform(post("/api/v1/inventory/dispense")
            .header("Authorization", "Bearer " + pharmacistToken())
            .contentType("application/json")
            .content("""
                {
                  "itemId": "%s",
                  "lotId": "%s",
                  "medicalRecordId": "%s",
                  "prescriptionItemName": "%s",
                  "quantity": 1
                }
                """.formatted(lot.getItem().getId(), lot.getId(), savedRecord.getId(), lot.getItem().getItemName())))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error.message").value("Prescription item is not present on the selected medical record"));
  }

  @Test
  void alertsListReturnsProperly() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/alerts")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  // ── RBAC ──────────────────────────────────────────────────────────────

  @Test
  void doctorCannotManageInventory() throws Exception {
    mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {
                  "sku": "UNAUTH-001",
                  "itemName": "Unauthorized Item",
                  "category": "Test",
                  "unit": "pcs",
                  "reorderLevel": 5
                }
                """))
        .andExpect(status().isForbidden());
  }

  private MedicalRecordEntity prescriptionRecord(com.hospital.core.appointment.AppointmentEntity appointment, String medicineName) {
    var record = new MedicalRecordEntity();
    record.setAppointment(appointment);
    record.setDiagnosis("Medication pickup test");
    record.setClinicalNotes("Prescription dispense integration coverage.");

    var prescription = new PrescriptionItemEntity();
    prescription.setMedicalRecord(record);
    prescription.setMedicineName(medicineName);
    prescription.setDosage("1 unit");
    prescription.setFrequency("Once");
    prescription.setDurationDays(1);
    prescription.setSortOrder(0);
    record.getPrescriptionItems().add(prescription);
    return record;
  }
}
