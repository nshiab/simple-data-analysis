export default function renameColumnQuery(
    table: string,
    oldColumn: string,
    newColumn: string
) {
    return `ALTER TABLE ${table} RENAME COLUMN "${oldColumn}" TO "${newColumn}"`
}
