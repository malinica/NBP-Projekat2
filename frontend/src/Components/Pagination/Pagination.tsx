import React, { useState, useEffect } from "react";
import { Pagination as MaterialPagination, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";

type Props = {
    totalLength: number;
    onPaginateChange: (page: number, pageSize: number) => void;
    currentPage?: number;
    perPage?:number;
};

export const Pagination = ({ totalLength, onPaginateChange,currentPage=1,perPage=10 }: Props) => {
    const [page, setPage] = useState<number>(currentPage);
    const [pageSize, setPageSize] = useState<number>(perPage);

    const pageCount = Math.ceil(totalLength / pageSize);

    useEffect(() => {
        onPaginateChange(page, pageSize);
        console.log(page);
    }, [page, pageSize]);

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
        setPageSize(event.target.value as number);
        setPage(1);
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
            <MaterialPagination count={pageCount} page={page} onChange={handlePageChange} color="standard" />

            <FormControl variant="outlined" size="small">
                <InputLabel shrink>Po stranici</InputLabel>
                <Select value={pageSize} onChange={handlePageSizeChange} label="Po stranici">
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                </Select>
            </FormControl>
        </div>
    );
};