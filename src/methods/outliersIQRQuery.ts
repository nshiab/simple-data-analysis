export default function outliersIQRQuery(
    table: string,
    column: string,
    newColumn: string,
    parity: "even" | "odd"
) {
    const quantileFunc = parity === "even" ? "quantile_disc" : "quantile_cont"

    const query = `ALTER TABLE ${table}
    ADD COLUMN "${newColumn}" BOOLEAN;

    WITH iqr AS (
        SELECT
            ${quantileFunc}("${column}", 0.25) as q1,
            ${quantileFunc}("${column}", 0.75) as q3,
            (q3-q1)*1.5 as range,
            q1-range as lowThreshold,
            q3+range as highThreshold
        FROM ${table}
    )
    UPDATE ${table}
    SET "${newColumn}" = CASE
        WHEN "${column}" > (SELECT highThreshold FROM iqr) OR "${column}" < (SELECT lowThreshold FROM iqr) THEN TRUE
        ELSE FALSE
    END;`

    return query
}
