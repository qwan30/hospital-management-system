UPDATE invoices
SET status = CASE status
  WHEN 'PENDING' THEN 'UNPAID'
  WHEN 'VOID' THEN 'CANCELLED'
  ELSE status
END
WHERE status IN ('PENDING', 'VOID');

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

ALTER TABLE invoices
  ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('UNPAID', 'PAID', 'CANCELLED'));
