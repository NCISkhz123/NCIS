-- Script to clear all laundry transactions and stock movements
-- WARNING: This will delete all laundry operational data!

BEGIN;

-- Delete transaction tables
DELETE FROM public.laundry_receipt_transactions;
DELETE FROM public.laundry_distribution_transactions;
DELETE FROM public.laundry_return_transactions;
DELETE FROM public.laundry_internal_usage_transactions;
DELETE FROM public.laundry_stock_opname_sessions;

-- The transaction lines should be automatically deleted if they have ON DELETE CASCADE
-- Otherwise, if needed, run:
-- DELETE FROM public.laundry_receipt_transaction_lines;
-- DELETE FROM public.laundry_distribution_transaction_lines;
-- DELETE FROM public.laundry_return_transaction_lines;
-- DELETE FROM public.laundry_stock_opname_lines;

-- Delete all stock movements related to laundry
DELETE FROM public.laundry_stock_movements;

-- Reset all stock balances to 0 or delete them entirely
DELETE FROM public.laundry_stock_balances;

COMMIT;
