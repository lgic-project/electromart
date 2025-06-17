CREATE OR REPLACE FUNCTION decrement_product_quantity(product_id int8, quantity int8)
RETURNS VOID AS $$
BEGIN
UPDATE product
SET "maxQuantity" = "maxQuantity" - quantity
WHERE id = product_id AND "maxQuantity" >= quantity;
END;
$$ LANGUAGE plpgsql;