import { create } from "zustand";

interface RoomStore {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  setRoomId: (id) => set({ roomId: id }),
  reset: () => set({ roomId: null }),
}));
