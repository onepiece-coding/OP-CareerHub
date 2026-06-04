/**
 * @file src/components/ui/table/index.tsx
 */

import { getNestedValue } from "@/lib/utils";

import styles from "./styles.module.css";

export interface Column<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, record: T, rowIndex: number) => React.ReactNode;
  key: keyof T | string;
  header: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rowKey: keyof T;
  data: T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Table = <T extends Record<string, any>>({
  columns,
  rowKey,
  data,
}: TableProps<T>) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={styles.th}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                style={{ textAlign: "center" }}
                colSpan={columns.length}
                className={styles.td}
              >
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={String(row[rowKey])} className={styles.tr}>
                {columns.map((col) => {
                  const stringKey = String(col.key);
                  // Extract value cleanly even if nested (e.g. row.profilePhoto.url)
                  const cellValue = getNestedValue(row, stringKey);

                  return (
                    <td key={stringKey} className={styles.td}>
                      {col.render
                        ? col.render(cellValue, row, rowIndex)
                        : (cellValue?.toString() ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
