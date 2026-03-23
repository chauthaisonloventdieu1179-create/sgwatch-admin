import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./features/user/accountSlice";
import { authReducer } from "./features/auth/authSlice";
export const store = configureStore({
  reducer: {
    profile: profileReducer,
    auth: authReducer,
  },
});
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
