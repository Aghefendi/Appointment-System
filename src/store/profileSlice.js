import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: true,
  userData: null,
  appointmentCount: 0,
  documentCount: 0,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setAppointmentCount: (state, action) => {
      state.appointmentCount = action.payload;
    },
    setDocumentCount: (state, action) => {
      state.documentCount = action.payload;
    },
  },
});

export const {
  setLoading,
  setUserData,
  setAppointmentCount,
  setDocumentCount,
} = profileSlice.actions;

export default profileSlice.reducer;
