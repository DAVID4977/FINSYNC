-- GST Filing Database - Formatted Viewing Queries
-- Run these queries in your MySQL client for better formatted output

USE gst_filing_db;

-- Set display preferences for better formatting
SET SESSION sql_mode = '';
SET GLOBAL sql_mode = '';

-- 1. USERS TABLE (Formatted View)
SELECT 
    SUBSTR(id, 1, 8) AS 'User ID',
    email AS 'Email',
    name AS 'Name', 
    company AS 'Company',
    gstin AS 'GSTIN',
    role AS 'Role',
    CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END AS 'Status',
    DATE_FORMAT(created_at, '%Y-%m-%d') AS 'Created'
FROM users 
ORDER BY created_at DESC;

-- 2. INVOICES TABLE (Formatted View)
SELECT 
    SUBSTR(id, 1, 8) AS 'ID',
    invoice_number AS 'Invoice #',
    DATE_FORMAT(invoice_date, '%Y-%m-%d') AS 'Date',
    buyer_name AS 'Buyer',
    CONCAT('₹', FORMAT(invoice_value, 2)) AS 'Invoice Value',
    CONCAT('₹', FORMAT(taxable_value, 2)) AS 'Taxable Value',
    CONCAT('₹', FORMAT(COALESCE(igst_amount, 0) + COALESCE(cgst_amount, 0) + COALESCE(sgst_amount, 0), 2)) AS 'Total Tax',
    hsn_code AS 'HSN',
    status AS 'Status'
FROM invoices 
ORDER BY created_at DESC 
LIMIT 20;

-- 3. GST RETURNS TABLE (Formatted View)
SELECT 
    SUBSTR(id, 1, 8) AS 'ID',
    return_type AS 'Type',
    period AS 'Period',
    financial_year AS 'FY',
    status AS 'Status',
    CONCAT('₹', FORMAT(total_turnover, 2)) AS 'Turnover',
    CONCAT('₹', FORMAT(total_tax, 2)) AS 'Total Tax',
    DATE_FORMAT(created_at, '%Y-%m-%d') AS 'Created'
FROM gst_returns 
ORDER BY created_at DESC;

-- 4. UPLOADED FILES TABLE (Formatted View)  
SELECT 
    SUBSTR(id, 1, 8) AS 'ID',
    file_name AS 'File Name',
    original_name AS 'Original Name',
    CONCAT(ROUND(file_size/1024, 1), ' KB') AS 'Size',
    file_type AS 'Type',
    status AS 'Status',
    invoices_extracted AS 'Invoices',
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS 'Uploaded'
FROM uploaded_files 
ORDER BY created_at DESC;

-- 5. DOWNLOAD HISTORY TABLE (Formatted View)
SELECT 
    SUBSTR(id, 1, 8) AS 'ID',
    filename AS 'File Name',
    file_type AS 'Type',
    download_type AS 'Download Type',
    CONCAT(ROUND(file_size/1024, 1), ' KB') AS 'Size',
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS 'Downloaded'
FROM download_history 
ORDER BY created_at DESC 
LIMIT 15;

-- 6. DATABASE SUMMARY
SELECT 
    'USERS' AS 'Table',
    COUNT(*) AS 'Records'
FROM users
UNION ALL
SELECT 'INVOICES', COUNT(*) FROM invoices
UNION ALL  
SELECT 'GST_RETURNS', COUNT(*) FROM gst_returns
UNION ALL
SELECT 'UPLOADED_FILES', COUNT(*) FROM uploaded_files
UNION ALL
SELECT 'DOWNLOADS', COUNT(*) FROM download_history;

-- 7. FINANCIAL SUMMARY
SELECT 
    COUNT(*) AS 'Total Invoices',
    CONCAT('₹', FORMAT(SUM(COALESCE(invoice_value, 0)), 2)) AS 'Total Invoice Value',
    CONCAT('₹', FORMAT(SUM(COALESCE(taxable_value, 0)), 2)) AS 'Total Taxable Value',
    CONCAT('₹', FORMAT(SUM(COALESCE(igst_amount, 0)), 2)) AS 'Total IGST',
    CONCAT('₹', FORMAT(SUM(COALESCE(cgst_amount, 0)), 2)) AS 'Total CGST',
    CONCAT('₹', FORMAT(SUM(COALESCE(sgst_amount, 0)), 2)) AS 'Total SGST',
    CONCAT('₹', FORMAT(SUM(COALESCE(igst_amount, 0) + COALESCE(cgst_amount, 0) + COALESCE(sgst_amount, 0)), 2)) AS 'Total Tax Collected'
FROM invoices;

-- 8. MONTHLY GST ANALYSIS
SELECT 
    DATE_FORMAT(invoice_date, '%Y-%m') AS 'Month',
    COUNT(*) AS 'Invoices',
    CONCAT('₹', FORMAT(SUM(COALESCE(invoice_value, 0)), 2)) AS 'Total Value',
    CONCAT('₹', FORMAT(SUM(COALESCE(igst_amount, 0) + COALESCE(cgst_amount, 0) + COALESCE(sgst_amount, 0)), 2)) AS 'Tax Collected'
FROM invoices 
WHERE invoice_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(invoice_date, '%Y-%m')
ORDER BY Month DESC;