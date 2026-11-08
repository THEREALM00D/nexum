import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type { FieldGroup, FieldDef } from "./types";
import SectionTitle from "../common/SectionTitle";

interface Props {
  group: FieldGroup;
  renderField: (field: FieldDef) => ReactNode;
  expanded: boolean;
  onToggle: () => void;
}

export default function ConfigGroup({
  group,
  renderField,
  expanded,
  onToggle,
}: Props) {
  const { t } = useTranslation();
  return (
    <Accordion expanded={expanded} onChange={onToggle} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <SectionTitle component="span">{t(group.labelKey)}</SectionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {group.fields.map((field, idx) => (
            <div key={field.key}>
              {idx > 0 && <Divider />}
              {renderField(field)}
            </div>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
