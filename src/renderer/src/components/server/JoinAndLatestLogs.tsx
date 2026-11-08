import { Box } from "@mui/material";
import JoinServerCard from "./JoinServerCard";
import LatestLogsCard from "./LatestLogsCard";

/** Côte à côte sur un écran large, l'une sous l'autre dans une fenêtre étroite. */
export default function JoinAndLatestLogs() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      <Box sx={{ flex: "1 1 360px", minWidth: 0 }}>
        <JoinServerCard />
      </Box>
      <Box sx={{ flex: "1 1 420px", minWidth: 0 }}>
        <LatestLogsCard />
      </Box>
    </Box>
  );
}
