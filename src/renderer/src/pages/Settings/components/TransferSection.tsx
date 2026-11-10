import { useState } from "react";
import { Button, Stack } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useTranslation } from "react-i18next";
import SettingsSection from "./SettingsSection";
import ImportSettingsDialog from "./ImportSettingsDialog";
import ExportDialog from "../../../components/transfer/ExportDialog";
import { useExportFile } from "../../../components/transfer/useExportFile";
import { useSettingsImport } from "../hooks/useSettingsImport";

// « Changer de PC » : export / import des réglages (src/main/transfer/).
export default function TransferSection({
  onImported,
}: {
  onImported: () => void;
}) {
  const { t } = useTranslation();
  const [exportOpen, setExportOpen] = useState(false);
  const exportFile = useExportFile();
  const { preview, pickFile, runImport, close } = useSettingsImport(onImported);

  return (
    <SettingsSection
      title={t("settings.transfer.title")}
      description={t("settings.transfer.description")}
    >
      <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          onClick={() => setExportOpen(true)}
        >
          {t("settings.transfer.exportButton")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={pickFile}
        >
          {t("settings.transfer.importButton")}
        </Button>
      </Stack>

      <ExportDialog
        open={exportOpen}
        title={t("settings.transfer.exportButton")}
        description={t("settings.transfer.exportDescription")}
        onClose={() => setExportOpen(false)}
        onExport={(includePasswords) =>
          exportFile(() => window.api.transfer.exportSettings(includePasswords))
        }
      />
      <ImportSettingsDialog
        preview={preview}
        onClose={close}
        onImport={runImport}
      />
    </SettingsSection>
  );
}
