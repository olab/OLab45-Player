export const SCOPE_LEVELS = ["Maps", "Servers", "Courses", "Globals"];

export const TOOLS_MENU_ITEMS = {
  HELP: "Help",
  ABOUT: "About",
  PREFERENCES: "Preferences",
};

export const SCOPED_OBJECTS = {
  FILE: { name: "File", showInNavBar: true },
  COUNTER: { name: "Counter", showInNavBar: true },
  CONSTANT: { name: "Constant", showInNavBar: true },
  QUESTION: { name: "Question", showInNavBar: true },
  QUESTIONRESPONSES: { name: "QuestionResponse", showInNavBar: false },
};

export const PAGE_TITLES = {
  HOME: "OLab",
  NOT_FOUND: "Page not found",
  PLAYER: "OLab4 Player",
  SO_LIST: (objectType) => `${objectType}s`,
  ADD_SO: (objectType) => `Add ${objectType}`,
  EDIT_SO: (objectType) => `Edit ${objectType}`,
};

export const LINK_STYLES = [
  "Hyperlinks",
  "Dropdown",
  "Dropdown + Confidence",
  "Type in text",
  "Buttons",
];

export const KEY_S = 83;
