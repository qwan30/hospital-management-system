package com.hospital.core.support;

import com.hospital.shared.admin.SupportTicketResponse;
import java.io.StringWriter;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupportTicketService {
  private final SupportTicketRepository repository;

  public SupportTicketService(SupportTicketRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public Page<SupportTicketResponse> listTickets(int page, int size) {
    return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
        .map(this::toResponse);
  }

  @Transactional(readOnly = true)
  public String exportToCsv() {
    List<SupportTicketEntity> tickets = repository.findAll();
    StringWriter writer = new StringWriter();
    writer.write("Ticket ID,Requester Name,Department,Priority,Status,Owner Name,Wait Time,SLA\n");
    for (SupportTicketEntity t : tickets) {
      writer.write(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
          escapeCsv(t.getTicketId()),
          escapeCsv(t.getRequesterName()),
          escapeCsv(t.getDepartment()),
          escapeCsv(t.getPriority()),
          escapeCsv(t.getStatus()),
          escapeCsv(t.getOwnerName()),
          escapeCsv(t.getWaitTime()),
          escapeCsv(t.getSla())
      ));
    }
    return writer.toString();
  }

  private String escapeCsv(String value) {
    if (value == null) return "";
    String escaped = value.replace("\"", "\"\"");
    if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
      return "\"" + escaped + "\"";
    }
    return escaped;
  }

  private SupportTicketResponse toResponse(SupportTicketEntity entity) {
    return new SupportTicketResponse(
        entity.getId(),
        entity.getTicketId(),
        entity.getRequesterName(),
        entity.getDepartment(),
        entity.getPriority(),
        entity.getStatus(),
        entity.getOwnerName(),
        entity.getWaitTime(),
        entity.getSla(),
        entity.getCreatedAt()
    );
  }
}
