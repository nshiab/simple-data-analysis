import React from "react"
import { Table, TableContainer, Paper, TableHead, TableCell, TableRow, TableBody } from "@mui/material"

interface Props {
    columns: any[],
    rows: any[]
}

export default function T({ rows, columns }: Props) {

    return <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    {columns.map(d => <TableCell key={d}>{d}</TableCell>)}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((d, i) => <TableRow key={"tb-" + i}>
                    {columns.map((key, j) => <TableCell key={"tc-" + i + "-" + j}>{d[key]}</TableCell>)}
                </TableRow>)}
            </TableBody>
        </Table>
    </TableContainer>
}