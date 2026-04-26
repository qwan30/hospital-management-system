ALTER TABLE inventory_items
  ADD CONSTRAINT inventory_items_reorder_level_non_negative
  CHECK (reorder_level >= 0);

ALTER TABLE inventory_items
  ADD CONSTRAINT inventory_items_quantity_on_hand_non_negative
  CHECK (quantity_on_hand >= 0);

ALTER TABLE inventory_lots
  ADD CONSTRAINT inventory_lots_quantity_received_non_negative
  CHECK (quantity_received >= 0);

ALTER TABLE inventory_lots
  ADD CONSTRAINT inventory_lots_quantity_remaining_non_negative
  CHECK (quantity_remaining >= 0);

ALTER TABLE inventory_lots
  ADD CONSTRAINT inventory_lots_quantity_remaining_within_received
  CHECK (quantity_remaining <= quantity_received);
