import { createSlice } from "@reduxjs/toolkit";
import themeStyle from "../Style/themeStyle"; // doğru yolu ayarla

const initialState = {
  mode: "light", // "dark" veya "light"
  theme: themeStyle.light,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newMode = state.mode === "light" ? "dark" : "light";
      state.mode = newMode;
      state.theme = themeStyle[newMode];
    },
    setThemeMode: (state, action) => {
      const mode = action.payload;
      state.mode = mode;
      state.theme = themeStyle[mode];
    },
  },
});

export const { toggleTheme, setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
