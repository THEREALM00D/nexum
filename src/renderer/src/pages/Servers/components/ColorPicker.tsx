import { Box, ButtonBase, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SERVER_COLORS } from "@shared/serverColors";
import ServerTile from "../../../components/common/ServerTile";
import { FOCUS_RING_SX } from "../../../theme";

interface Props {
  /** Nom saisi : les pastilles montrent la tuile telle qu'elle s'affichera. */
  name: string;
  value: string | null;
  onChange: (color: string) => void;
}

export default function ColorPicker({ name, value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Box>
      <Box
        sx={{ typography: "caption", color: "text.secondary", mb: 1 }}
        component="div"
      >
        {t("servers.dialog.color")}
      </Box>
      <Stack direction="row" spacing={1}>
        {SERVER_COLORS.map((c) => (
          <ButtonBase
            key={c}
            onClick={() => onChange(c)}
            aria-label={`${t("servers.dialog.color")} ${c}`}
            aria-pressed={value === c}
            sx={{
              borderRadius: 1,
              border: "2px solid",
              borderColor: value === c ? "text.primary" : "transparent",
              transition: "transform 0.1s",
              "&:hover": { transform: "scale(1.1)" },
              ...FOCUS_RING_SX,
            }}
          >
            <ServerTile name={name} color={c} size={28} />
          </ButtonBase>
        ))}
      </Stack>
    </Box>
  );
}
