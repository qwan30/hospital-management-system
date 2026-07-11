package com.hospital.core.support;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "support_tickets")
public class SupportTicketEntity {
  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, unique = true)
  private String ticketId;

  @Column(nullable = false)
  private String requesterName;

  @Column(nullable = false)
  private String department;

  @Column(nullable = false)
  private String priority;

  @Column(nullable = false)
  private String status;

  @Column
  private String ownerName;

  @Column
  private String waitTime;

  @Column
  private String sla;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  protected SupportTicketEntity() {}

  public SupportTicketEntity(String ticketId, String requesterName, String department, String priority, String status, String ownerName, String waitTime, String sla) {
    this.ticketId = ticketId;
    this.requesterName = requesterName;
    this.department = department;
    this.priority = priority;
    this.status = status;
    this.ownerName = ownerName;
    this.waitTime = waitTime;
    this.sla = sla;
  }

  public UUID getId() { return id; }
  public String getTicketId() { return ticketId; }
  public String getRequesterName() { return requesterName; }
  public String getDepartment() { return department; }
  public String getPriority() { return priority; }
  public String getStatus() { return status; }
  public String getOwnerName() { return ownerName; }
  public String getWaitTime() { return waitTime; }
  public String getSla() { return sla; }
  public Instant getCreatedAt() { return createdAt; }
}
