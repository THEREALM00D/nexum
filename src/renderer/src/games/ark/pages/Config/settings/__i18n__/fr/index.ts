import rates from "./rates";
import players from "./players";
import creatures from "./creatures";
import breeding from "./breeding";
import structures from "./structures";
import rulesTribes from "./rulesTribes";
import world from "./world";
import transfers from "./transfers";
import features from "./features";
import craftingInterface from "./craftingInterface";
import admin from "./admin";
import launch from "./launch";
import ui from "./ui";
import lists from "./lists";

// Libellés et descriptions des réglages, par clé (une seule clé de 1er
// niveau : la fusion i18n des manifests n'en garde qu'une).
export default {
  arkSettings: {
    ...rates,
    ...players,
    ...creatures,
    ...breeding,
    ...structures,
    ...rulesTribes,
    ...world,
    ...transfers,
    ...features,
    ...craftingInterface,
    ...admin,
    ...launch,
  },
  ...ui,
  ...lists,
};
