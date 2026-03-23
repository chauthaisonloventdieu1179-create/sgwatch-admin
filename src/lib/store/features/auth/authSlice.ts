import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  authState: null,
  me: null,
} as {
  authState?: boolean | null;
  me: any;
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<any>) => {
      state.authState = action.payload;
    },
    setMeData: (state, action: PayloadAction<any>) => {
      state.me = action.payload;
      if (action.payload) {
        state.authState = true;
      } else {
        state.authState = false;
      }
    },
  },
});

export const { setAuthState, setMeData } = authSlice.actions;
export const authReducer = authSlice.reducer;
