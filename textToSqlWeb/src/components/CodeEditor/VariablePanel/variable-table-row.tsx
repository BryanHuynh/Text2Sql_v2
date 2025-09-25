import { useCallback, useRef, useState, type KeyboardEventHandler } from "react";
import {
	Checkbox,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TableCell,
	TableRow,
	TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { TableVariable, TableVariableReq } from "../../../services/database/table-variables";
import { VariableTypes } from "./VariableTypes";

interface VariableTableRowProps {
	variable: TableVariable;
	updateVariable: (variable: TableVariableReq) => Promise<void>;
	deleteVariable: (id: string) => Promise<void>;
}

export const VariableTableRow = ({
	variable,
	updateVariable,
	deleteVariable,
}: VariableTableRowProps) => {
	const [value, setValue] = useState<TableVariable>(variable);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const original = useRef<TableVariable>(variable);

	function createReferenceLabel(v: TableVariable) {
		const ref = v.referenceTable;
		if (!ref?.userTable) return "";
		return `${ref.userTable.tablename}.${ref.variableName}`;
	}

	const commit = useCallback(
		async (next?: TableVariable) => {
			const candidate = next ?? value;
			if (JSON.stringify(candidate) === JSON.stringify(original.current)) return;

			setSaving(true);
			setError(null);
			try {
				await updateVariable(candidate);
				original.current = candidate;
			} catch (e) {
				setError((e as Error).message ?? "Failed to save changes");
				setValue(original.current);
			} finally {
				setSaving(false);
			}
		},
		[value]
	);

	const setVarName = (name: string) => setValue((prev) => ({ ...prev, variableName: name }));

	const setVarType = (typ: string) => setValue((prev) => ({ ...prev, variableType: typ }));

	const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key == "Escape") {
			setValue(original.current);
			(e.currentTarget as HTMLInputElement).blur();
		}
	};

	return (
		<TableRow hover>
			<TableCell>
				<TextField
					variant="outlined"
					value={value.variableName}
					onChange={(e) => setVarName(e.target.value)}
					onBlur={() => commit()}
					onKeyDown={onKeyDown}
					disabled={saving}
					error={!!error}
					fullWidth
				/>
			</TableCell>

			<TableCell align="left" sx={{ minWidth: "10rem" }}>
				<FormControl fullWidth>
					<Select
						value={value.variableType}
						onChange={(e) => {
							setVarType(e.target.value);
						}}
						onBlur={() => commit()}
						fullWidth
					>
						{VariableTypes.map((type) => (
							<MenuItem value={type}>{type.toUpperCase()}</MenuItem>
						))}
					</Select>
				</FormControl>
			</TableCell>

			<TableCell>
				<Checkbox
					checked={value.pk_flag}
					onChange={(e) => {
						const next = { ...value, pk_flag: e.target.checked };
						setValue(next);
						commit(next);
					}}
					disabled={saving}
				/>
			</TableCell>

			<TableCell>
				<Checkbox
					checked={value.fk_flag}
					onChange={(e) => {
						const checked = e.target.checked;
						const next: TableVariable = {
							...value,
							fk_flag: checked,
							referenceTable: checked ? value.referenceTable : undefined,
						};
						setValue(next);
						commit(next);
					}}
					disabled={saving}
				/>
			</TableCell>

			<TableCell align="right">
				{value.fk_flag && (
					<TextField
						variant="outlined"
						value={createReferenceLabel(value)}
						disabled
						fullWidth
					/>
				)}
			</TableCell>

			<TableCell component="th" scope="row" sx={{ p: 0 }}>
				<IconButton disabled={saving} onClick={() => deleteVariable(variable.id)}>
					<DeleteOutlineIcon color="error" />
				</IconButton>
			</TableCell>
		</TableRow>
	);
};
