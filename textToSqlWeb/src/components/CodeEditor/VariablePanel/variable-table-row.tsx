import { useCallback, useEffect, useRef, useState, type KeyboardEventHandler } from "react";
import {
	Checkbox,
	FormControl,
	IconButton,
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
	allTableVariables: TableVariable[];
	variable: TableVariable;
	updateVariable: (variable: TableVariableReq) => Promise<void>;
	deleteVariable: (id: string) => Promise<void>;
}

export const VariableTableRow = ({
	allTableVariables,
	variable,
	updateVariable,
	deleteVariable,
}: VariableTableRowProps) => {
	const [value, setValue] = useState<TableVariable>(variable);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const original = useRef<TableVariable>(variable);

	function createReferenceLabel(v: TableVariable) {
		return `${v.userTable.tablename}.${v.variableName}`;
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

	const setRefVariable = (ref: TableVariable) =>
		setValue((prev) => ({ ...prev, referenceVariable: ref }));

	const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key == "Escape") {
			setValue(original.current);
			(e.currentTarget as HTMLInputElement).blur();
		}
	};

	useEffect(() => {
		// console.log(value);
	}, [value]);

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
							referenceVariable: checked ? value.referenceVariable : undefined,
						};
						setValue(next);
						commit(next);
					}}
					disabled={saving}
				/>
			</TableCell>

			<TableCell align="center" sx={{ minWidth: "10rem" }}>
				{value.fk_flag && (
					<FormControl fullWidth>
						<Select
							value={value.referenceVariable ? value.referenceVariable.id : ""}
							onChange={(e) => {
								const selectedVariable = allTableVariables.find(
									(variable) => variable.id === e.target.value
								);
								if (!selectedVariable) return;
								setRefVariable(selectedVariable);
							}}
							onBlur={() => commit()}
							fullWidth
						>
							{allTableVariables
								.sort((a, b) => {
									if (a.userTable.tablename != b.userTable.tablename) {
										return a.userTable.tablename.localeCompare(
											b.userTable.tablename
										);
									}
									return a.variableName.localeCompare(b.variableName);
								})
								.map((variable) => (
									<MenuItem value={variable.id}>
										{createReferenceLabel(variable)}
									</MenuItem>
								))}
						</Select>
					</FormControl>
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
