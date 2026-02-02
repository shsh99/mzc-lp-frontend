"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
} from "lucide-react";

import { cn } from '@/utils/cn';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/Table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/common/DropdownMenu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/Select';
import type { DataTableProps, DataTableLabels, DataTableColumnHeaderProps } from './DataTable.types';

const defaultLabels: DataTableLabels = {
  columns: 'Columns',
  noResults: 'No results.',
  rowsSelected: '{selected} of {total} row(s) selected.',
  rowsPerPage: 'Rows per page',
  pageOf: 'Page {current} of {total}',
  goToFirstPage: 'Go to first page',
  goToPreviousPage: 'Go to previous page',
  goToNextPage: 'Go to next page',
  goToLastPage: 'Go to last page',
};

function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  showColumnToggle = true,
  showPagination = true,
  pageSize = 10,
  labels: customLabels,
  onRowClick,
  rowClassName,
  manualPagination = false,
  pageCount,
  pageIndex = 0,
  onPageChange,
  onPageSizeChange,
  manualSorting = false,
  onSortingChange: onSortingChangeProp,
  sorting: sortingProp,
}: DataTableProps<TData, TValue>) {
  const labels = { ...defaultLabels, ...customLabels };
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalPageIndex, setInternalPageIndex] = React.useState(0);
  const [internalPageSize, setInternalPageSize] = React.useState(pageSize);

  // 서버사이드 페이지네이션 시 외부 pageIndex 사용
  const currentPageIndex = manualPagination ? pageIndex : internalPageIndex;
  const currentPageSize = manualPagination ? pageSize : internalPageSize;

  // 서버사이드 정렬 시 외부 sorting 사용
  const currentSorting = manualSorting && sortingProp ? sortingProp : internalSorting;

  // 정렬 변경 핸들러
  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === 'function' ? updater(currentSorting) : updater;

      if (manualSorting) {
        onSortingChangeProp?.(newSorting);
      } else {
        setInternalSorting(newSorting);
      }
    },
    [currentSorting, manualSorting, onSortingChangeProp]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination,
    manualSorting,
    pageCount: manualPagination ? pageCount : undefined,
    initialState: {
      pagination: {
        pageSize: currentPageSize,
        pageIndex: currentPageIndex,
      },
    },
    state: {
      sorting: currentSorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPageIndex,
        pageSize: currentPageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function'
        ? updater({ pageIndex: currentPageIndex, pageSize: currentPageSize })
        : updater;

      if (manualPagination) {
        if (newState.pageIndex !== currentPageIndex) {
          onPageChange?.(newState.pageIndex);
        }
        if (newState.pageSize !== currentPageSize) {
          onPageSizeChange?.(newState.pageSize);
        }
      } else {
        setInternalPageIndex(newState.pageIndex);
        setInternalPageSize(newState.pageSize);
      }
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>
        {showColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                {labels.columns}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : "",
                    rowClassName?.(row.original)
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {labels.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {labels.rowsSelected
              ?.replace('{selected}', String(table.getFilteredSelectedRowModel().rows.length))
              .replace('{total}', String(table.getFilteredRowModel().rows.length))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium hidden sm:block">{labels.rowsPerPage}</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              {labels.pageOf
                ?.replace('{current}', String(table.getState().pagination.pageIndex + 1))
                .replace('{total}', String(table.getPageCount()))}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">{labels.goToFirstPage}</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">{labels.goToPreviousPage}</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">{labels.goToNextPage}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">{labels.goToLastPage}</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sortable header helper
function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  const sorted = column.getIsSorted();
  // @ts-expect-error - columnDef may not have enableSorting property
  const canSort = column.columnDef.enableSorting !== false;

  // 정렬 불가능한 컬럼은 일반 텍스트로 표시
  if (!canSort) {
    return (
      <div className={cn("flex items-center h-8 -ml-3 px-3", className)}>
        {title}
      </div>
    );
  }

  // 정렬 가능한 컬럼은 버튼과 아이콘으로 표시
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

export { DataTable, DataTableColumnHeader };
