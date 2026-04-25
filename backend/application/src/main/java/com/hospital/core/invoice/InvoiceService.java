package com.hospital.core.invoice;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.audit.AuditLogService;
import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.InvoiceStatus;
import com.hospital.shared.finance.DailyRevenueReportResponse;
import com.hospital.shared.finance.InvoiceResponse;
import com.hospital.shared.finance.MonthlyRevenueReportResponse;
import com.hospital.shared.finance.RevenueDepartmentResponse;
import com.hospital.shared.finance.ServicePricingResponse;
import com.hospital.shared.finance.ServicePricingUpsertRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoiceService {
  private static final BigDecimal DEFAULT_CONSULTATION_AMOUNT = BigDecimal.valueOf(250000);

  private final AppointmentRepository appointmentRepository;
  private final AuditLogService auditLogService;
  private final DepartmentRepository departmentRepository;
  private final InvoiceRepository invoiceRepository;
  private final ServicePricingRepository servicePricingRepository;

  public InvoiceService(
      AppointmentRepository appointmentRepository,
      AuditLogService auditLogService,
      DepartmentRepository departmentRepository,
      InvoiceRepository invoiceRepository,
      ServicePricingRepository servicePricingRepository) {
    this.appointmentRepository = appointmentRepository;
    this.auditLogService = auditLogService;
    this.departmentRepository = departmentRepository;
    this.invoiceRepository = invoiceRepository;
    this.servicePricingRepository = servicePricingRepository;
  }

  @Transactional(readOnly = true)
  public List<InvoiceResponse> listInvoices(InvoiceStatus status) {
    var invoices = status == null
        ? invoiceRepository.findAllByOrderByCreatedAtDesc()
        : invoiceRepository.findByStatusOrderByCreatedAtDesc(status);
    return invoices.stream().map(this::toInvoiceResponse).toList();
  }

  @Transactional
  public InvoiceResponse createInvoice(UUID appointmentId) {
    if (invoiceRepository.existsByAppointmentId(appointmentId)) {
      throw new ConflictException("Invoice already exists for this appointment");
    }

    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (appointment.getStatus() != AppointmentStatus.DONE) {
      throw new ConflictException("Only completed appointments can be invoiced");
    }

    var invoice = new InvoiceEntity();
    invoice.setAppointment(appointment);
    invoice.setTotalAmount(resolveAmount(appointment));
    invoice.setStatus(InvoiceStatus.UNPAID);
    var saved = invoiceRepository.save(invoice);
    auditLogService.record(
        "INVOICE_CREATED",
        "INVOICE",
        saved.getId(),
        java.util.Map.of("appointmentId", appointmentId.toString(), "status", saved.getStatus().name()));
    return toInvoiceResponse(saved);
  }

  @Transactional
  public InvoiceResponse recordPayment(UUID invoiceId, String paymentMethod) {
    var invoice = invoiceRepository.findById(invoiceId)
        .orElseThrow(() -> new NotFoundException("Invoice not found"));

    if (invoice.getStatus() != InvoiceStatus.UNPAID) {
      throw new ConflictException("Only pending invoices can be paid");
    }

    invoice.setStatus(InvoiceStatus.PAID);
    invoice.setPaymentMethod(paymentMethod);
    invoice.setPaidAt(Instant.now());
    auditLogService.record(
        "INVOICE_PAID",
        "INVOICE",
        invoice.getId(),
        java.util.Map.of("paymentMethod", paymentMethod, "status", invoice.getStatus().name()));
    return toInvoiceResponse(invoice);
  }

  @Transactional
  public InvoiceResponse voidInvoice(UUID invoiceId) {
    var invoice = invoiceRepository.findById(invoiceId)
        .orElseThrow(() -> new NotFoundException("Invoice not found"));

    if (invoice.getStatus() == InvoiceStatus.PAID) {
      throw new ConflictException("Paid invoices cannot be voided");
    }

    invoice.setStatus(InvoiceStatus.CANCELLED);
    auditLogService.record(
        "INVOICE_CANCELLED",
        "INVOICE",
        invoice.getId(),
        java.util.Map.of("status", invoice.getStatus().name()));
    return toInvoiceResponse(invoice);
  }

  @Transactional(readOnly = true)
  public List<ServicePricingResponse> listPricing() {
    return servicePricingRepository.findAllByOrderByEffectiveDateDescServiceNameAsc().stream()
        .map(this::toServicePricingResponse)
        .sorted(Comparator.comparing(ServicePricingResponse::effectiveDate).reversed())
        .toList();
  }

  @Transactional
  public ServicePricingResponse createPricing(ServicePricingUpsertRequest request) {
    var pricing = new ServicePricingEntity();
    applyPricing(pricing, request);
    var saved = servicePricingRepository.save(pricing);
    auditLogService.record(
        "PRICING_CREATED",
        "PRICING",
        saved.getId(),
        java.util.Map.of("serviceName", saved.getServiceName(), "amount", saved.getAmount()));
    return toServicePricingResponse(saved);
  }

  @Transactional
  public ServicePricingResponse updatePricing(UUID pricingId, ServicePricingUpsertRequest request) {
    var pricing = servicePricingRepository.findById(pricingId)
        .orElseThrow(() -> new NotFoundException("Pricing rule not found"));
    applyPricing(pricing, request);
    auditLogService.record(
        "PRICING_UPDATED",
        "PRICING",
        pricing.getId(),
        java.util.Map.of("serviceName", pricing.getServiceName(), "amount", pricing.getAmount()));
    return toServicePricingResponse(pricing);
  }

  @Transactional(readOnly = true)
  public DailyRevenueReportResponse getDailyRevenue(LocalDate date) {
    var invoices = invoiceRepository.findByStatusOrderByCreatedAtDesc(InvoiceStatus.PAID).stream()
        .filter(invoice -> invoice.getAppointment().getAppointmentDate().equals(date))
        .toList();
    return new DailyRevenueReportResponse(
        date,
        invoices.stream().map(InvoiceEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
        invoices.size(),
        groupByDepartment(invoices));
  }

  @Transactional(readOnly = true)
  public MonthlyRevenueReportResponse getMonthlyRevenue(YearMonth month) {
    var invoices = invoiceRepository.findByStatusOrderByCreatedAtDesc(InvoiceStatus.PAID).stream()
        .filter(invoice -> YearMonth.from(invoice.getAppointment().getAppointmentDate()).equals(month))
        .toList();
    return new MonthlyRevenueReportResponse(
        month.toString(),
        invoices.stream().map(InvoiceEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
        invoices.size());
  }

  private void applyPricing(ServicePricingEntity pricing, ServicePricingUpsertRequest request) {
    var department = request.departmentId() == null
        ? null
        : departmentRepository.findById(request.departmentId())
            .orElseThrow(() -> new NotFoundException("Department not found"));
    pricing.setDepartment(department);
    pricing.setServiceName(request.serviceName().trim());
    pricing.setAmount(request.amount());
    pricing.setEffectiveDate(request.effectiveDate());
  }

  private BigDecimal resolveAmount(com.hospital.core.appointment.AppointmentEntity appointment) {
    var department = appointment.getDoctor().getDepartment();
    if (department == null) {
      return DEFAULT_CONSULTATION_AMOUNT;
    }

    return servicePricingRepository
        .findTopByDepartmentIdAndServiceNameIgnoreCaseAndEffectiveDateLessThanEqualOrderByEffectiveDateDesc(
            department.getId(),
            "CONSULTATION",
            appointment.getAppointmentDate())
        .map(ServicePricingEntity::getAmount)
        .orElse(DEFAULT_CONSULTATION_AMOUNT);
  }

  private List<RevenueDepartmentResponse> groupByDepartment(List<InvoiceEntity> invoices) {
    return invoices.stream()
        .collect(java.util.stream.Collectors.groupingBy(
            invoice -> invoice.getAppointment().getDoctor().getDepartment() == null
                ? "Unassigned"
                : invoice.getAppointment().getDoctor().getDepartment().getName()))
        .entrySet()
        .stream()
        .map(entry -> new RevenueDepartmentResponse(
            entry.getKey(),
            entry.getValue().stream().map(InvoiceEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
            entry.getValue().size()))
        .sorted(Comparator.comparing(RevenueDepartmentResponse::totalRevenue).reversed())
        .toList();
  }

  private InvoiceResponse toInvoiceResponse(InvoiceEntity invoice) {
    var appointment = invoice.getAppointment();
    var department = appointment.getDoctor().getDepartment();
    return new InvoiceResponse(
        invoice.getId(),
        appointment.getId(),
        appointment.getPatient().getId(),
        appointment.getPatient().getFullName(),
        appointment.getDoctor().getFullName(),
        department == null ? null : department.getName(),
        appointment.getAppointmentDate(),
        invoice.getTotalAmount(),
        invoice.getStatus(),
        invoice.getPaymentMethod(),
        invoice.getPaidAt());
  }

  private ServicePricingResponse toServicePricingResponse(ServicePricingEntity pricing) {
    return new ServicePricingResponse(
        pricing.getId(),
        pricing.getDepartment() == null ? null : pricing.getDepartment().getId(),
        pricing.getDepartment() == null ? null : pricing.getDepartment().getName(),
        pricing.getServiceName(),
        pricing.getAmount(),
        pricing.getEffectiveDate());
  }
}
