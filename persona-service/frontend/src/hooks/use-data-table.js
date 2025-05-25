"use client";;
import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getSortingStateParser } from "@/lib/parsers";

const PAGE_KEY = "page";
const PER_PAGE_KEY = "perPage";
const SORT_KEY = "sort";
const ARRAY_SEPARATOR = ",";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

export function useDataTable(props) {
  const {
    columns,
    pageCount = -1,
    initialState,
    history = "replace",
    debounceMs = DEBOUNCE_MS,
    throttleMs = THROTTLE_MS,
    clearOnDefault = false,
    enableAdvancedFilter = false,
    scroll = false,
    shallow = true,
    startTransition,
    ...tableProps
  } = props;

  const queryStateOptions = React.useMemo(() => ({
    history,
    scroll,
    shallow,
    throttleMs,
    debounceMs,
    clearOnDefault,
    startTransition,
  }), [
    history,
    scroll,
    shallow,
    throttleMs,
    debounceMs,
    clearOnDefault,
    startTransition,
  ]);

  const [rowSelection, setRowSelection] = React.useState(initialState?.rowSelection ?? {});
  const [columnVisibility, setColumnVisibility] =
    React.useState(initialState?.columnVisibility ?? {});

  const [page, setPage] = useQueryState(PAGE_KEY, parseAsInteger.withOptions(queryStateOptions).withDefault(1));
  const [perPage, setPerPage] = useQueryState(PER_PAGE_KEY, parseAsInteger
    .withOptions(queryStateOptions)
    .withDefault(initialState?.pagination?.pageSize ?? 10));

  const pagination = React.useMemo(() => {
    return {
      pageIndex: page - 1, // zero-based index -> one-based index
      pageSize: perPage,
    };
  }, [page, perPage]);

  const onPaginationChange = React.useCallback((updaterOrValue) => {
    if (typeof updaterOrValue === "function") {
      const newPagination = updaterOrValue(pagination);
      void setPage(newPagination.pageIndex + 1);
      void setPerPage(newPagination.pageSize);
    } else {
      void setPage(updaterOrValue.pageIndex + 1);
      void setPerPage(updaterOrValue.pageSize);
    }
  }, [pagination, setPage, setPerPage]);

  const columnIds = React.useMemo(() => {
    return new Set(columns.map((column) => column.id).filter(Boolean));
  }, [columns]);

  const [sorting, setSorting] = useQueryState(SORT_KEY, getSortingStateParser(columnIds)
    .withOptions(queryStateOptions)
    .withDefault(initialState?.sorting ?? []));

  const onSortingChange = React.useCallback((updaterOrValue) => {
    if (typeof updaterOrValue === "function") {
      const newSorting = updaterOrValue(sorting);
      setSorting(newSorting);
    } else {
      setSorting(updaterOrValue);
    }
  }, [sorting, setSorting]);

  const filterableColumns = React.useMemo(() => {
    if (enableAdvancedFilter) return [];

    return columns.filter((column) => column.enableColumnFilter);
  }, [columns, enableAdvancedFilter]);

  const filterParsers = React.useMemo(() => {
    if (enableAdvancedFilter) return {};

    return filterableColumns.reduce((acc, column) => {
      if (column.meta?.options) {
        acc[column.id ?? ""] = parseAsArrayOf(parseAsString, ARRAY_SEPARATOR).withOptions(queryStateOptions);
      } else {
        acc[column.id ?? ""] = parseAsString.withOptions(queryStateOptions);
      }
      return acc;
    }, {});
  }, [filterableColumns, queryStateOptions, enableAdvancedFilter]);

  const [filterValues, setFilterValues] = useQueryStates(filterParsers);

  const debouncedSetFilterValues = useDebouncedCallback((values) => {
    void setPage(1);
    void setFilterValues(values);
  }, debounceMs);

  const initialColumnFilters = React.useMemo(() => {
    if (enableAdvancedFilter) return [];

    return Object.entries(filterValues).reduce((filters, [key, value]) => {
      if (value !== null) {
        const processedValue = Array.isArray(value)
          ? value
          : typeof value === "string" && /[^a-zA-Z0-9]/.test(value)
            ? value.split(/[^a-zA-Z0-9]+/).filter(Boolean)
            : [value];

        filters.push({
          id: key,
          value: processedValue,
        });
      }
      return filters;
    }, []);
  }, [filterValues, enableAdvancedFilter]);

  const [columnFilters, setColumnFilters] =
    React.useState(initialColumnFilters);

  const onColumnFiltersChange = React.useCallback((updaterOrValue) => {
    if (enableAdvancedFilter) return;

    setColumnFilters((prev) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue;

      const filterUpdates = next.reduce((acc, filter) => {
        if (filterableColumns.find((column) => column.id === filter.id)) {
          acc[filter.id] = filter.value;
        }
        return acc;
      }, {});

      for (const prevFilter of prev) {
        if (!next.some((filter) => filter.id === prevFilter.id)) {
          filterUpdates[prevFilter.id] = null;
        }
      }

      debouncedSetFilterValues(filterUpdates);
      return next;
    });
  }, [debouncedSetFilterValues, filterableColumns, enableAdvancedFilter]);

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table, shallow, debounceMs, throttleMs };
}
