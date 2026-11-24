import {
  Button,
  IconButton,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

/**
 * Colonne d'un tableau éditable. `text` / `number` : champ libre ;
 * `bool` : interrupteur ; `optionalBool` : « par défaut / oui / non » (le
 * champ n'est pas écrit quand il est laissé par défaut).
 */
export interface TableColumn<Row> {
  field: keyof Row & string;
  labelKey: string;
  type: "text" | "number" | "bool" | "optionalBool" | "list";
  placeholder?: string;
  minWidth?: number;
}

interface Props<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  disabled: boolean;
  onChange: (rows: Row[]) => void;
  newRow: () => Row;
  addLabelKey: string;
}

const OPTIONAL_VALUES = { "": null, true: true, false: false } as const;

// Lignes d'une liste de Game.ini : une ligne par entrée, ajout et retrait.
export default function EditableTable<Row extends object>({
  columns,
  rows,
  disabled,
  onChange,
  newRow,
  addLabelKey,
}: Props<Row>) {
  const { t } = useTranslation();
  const remove = t("arkListsUi.removeRow");
  const update = (index: number, field: keyof Row, value: unknown) =>
    onChange(
      rows.map((row, position) =>
        position === index ? { ...row, [field]: value } : row,
      ),
    );

  const cell = (row: Row, index: number, column: TableColumn<Row>) => {
    const value = row[column.field] as unknown;
    const label = t(column.labelKey);
    if (column.type === "bool") {
      return (
        <Switch
          size="small"
          checked={value === true}
          disabled={disabled}
          onChange={(event) =>
            update(index, column.field, event.target.checked)
          }
          slotProps={{ input: { "aria-label": label } }}
        />
      );
    }
    if (column.type === "optionalBool") {
      return (
        <TextField
          select
          size="small"
          value={value === null ? "" : String(value)}
          disabled={disabled}
          onChange={(event) =>
            update(
              index,
              column.field,
              OPTIONAL_VALUES[
                event.target.value as keyof typeof OPTIONAL_VALUES
              ],
            )
          }
          slotProps={{
            select: { displayEmpty: true },
            htmlInput: { "aria-label": label },
          }}
          sx={{ minWidth: 110 }}
        >
          <MenuItem value="">{t("arkListsUi.unset")}</MenuItem>
          <MenuItem value="true">{t("arkListsUi.yes")}</MenuItem>
          <MenuItem value="false">{t("arkListsUi.no")}</MenuItem>
        </TextField>
      );
    }
    const text =
      column.type === "list"
        ? ((value as string[]) ?? []).join(", ")
        : String(value ?? "");
    return (
      <TextField
        size="small"
        value={text}
        placeholder={column.placeholder}
        disabled={disabled}
        onChange={(event) =>
          update(
            index,
            column.field,
            column.type === "list"
              ? event.target.value.split(",").map((part) => part.trim())
              : event.target.value,
          )
        }
        slotProps={{
          htmlInput: {
            "aria-label": label,
            inputMode: column.type === "number" ? "decimal" : undefined,
          },
        }}
        sx={{ minWidth: column.minWidth ?? 100, width: "100%" }}
      />
    );
  };

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field}>{t(column.labelKey)}</TableCell>
              ))}
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    {cell(row, index, column)}
                  </TableCell>
                ))}
                <TableCell padding="checkbox">
                  <Tooltip title={remove}>
                    <span>
                      <IconButton
                        size="small"
                        aria-label={remove}
                        disabled={disabled}
                        onClick={() =>
                          onChange(
                            rows.filter((_, position) => position !== index),
                          )
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        size="small"
        startIcon={<AddIcon />}
        disabled={disabled}
        onClick={() => onChange([...rows, newRow()])}
        sx={{ alignSelf: "flex-start" }}
      >
        {t(addLabelKey)}
      </Button>
    </>
  );
}
