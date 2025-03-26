export type habitType = {
  id: number;
  name: string;
  created_at: number;
  days: string;
  done_times: number;
};

export type eventType = {
  id: number;
  habit_id: number;
  date: string;
  completed_at: number | null;
};

///
