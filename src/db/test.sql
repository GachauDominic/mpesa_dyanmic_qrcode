-- any merchant with the same CPI twice?
SELECT merchant_id, cpi, count(*) FROM merchant_channels
GROUP BY merchant_id, cpi HAVING count(*) > 1;

-- any merchant with more than one default channel?
SELECT merchant_id, count(*) FROM merchant_channels
WHERE is_default = true GROUP BY merchant_id HAVING count(*) > 1;