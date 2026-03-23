import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IProfile, IProfileRep } from "@/types/admin/mypage";
import { sendRequest } from "@/utils/api";
import { getToken } from "@/api/ServerActions";

interface AccountState {
  profile: IProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  profile: null,
  loading: false,
  error: null,
};

// thunk gọi API
export const fetchProfile = createAsyncThunk<IProfile>(
  "profile/ProfileAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const res = await sendRequest<IProfileRep>({
        url: "/user-info",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const accountSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearAccount(state) {
      state.profile = null;
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAccount, setProfile } = accountSlice.actions;
export default accountSlice.reducer;
