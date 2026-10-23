export type VisualAidType =
  | 'none'
  | 'ten_bundle' // Bó chục và que tính
  | 'group_array' // Nhóm đồ vật (quả táo, con gà)
  | 'clock' // Đồng hồ kim
  | 'measure_ruler' // Thước đo xăng-ti-mét
  | 'scale_balance' // Cân đĩa kg
  | 'shape_puzzle' // Hình học (tam giác, tứ giác, đường gấp khúc)
  | 'comparison_bar'; // Thanh so sánh nhiều hơn / ít hơn

export interface VisualAidData {
  type: VisualAidType;
  primaryValue?: number;
  secondaryValue?: number;
  itemEmoji?: string;
  groupCount?: number;
  itemsPerGroup?: number;
  hour?: number;
  minute?: number;
  lineSegments?: number[]; // [3, 4, 5] cm
  rulerLength?: number;
  leftWeight?: number;
  rightWeight?: number;
  shapeType?: 'triangle' | 'quadrilateral' | 'broken_line';
  barLan?: number;
  barMai?: number;
}

export interface MathQuestion {
  id: string;
  topicId: string;
  title: string;
  promptText: string; // Câu hỏi hiển thị
  speechText: string; // Nội dung đọc to
  equation?: string; // Ví dụ: 35 + 28 = ?
  options: (string | number)[];
  correctAnswer: string | number;
  explanation: string;
  hint: string;
  visualAid?: VisualAidData;
}

export interface LevelInfo {
  id: string;
  islandId: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  requiredStarsToUnlock: number;
  questions: MathQuestion[];
}

export interface IslandInfo {
  id: string;
  title: string;
  themeColor: string;
  accentBg: string;
  icon: string;
  description: string;
  levels: LevelInfo[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  totalStars: number;
  completedLevels: Record<string, number>; // levelId -> stars (1, 2, or 3)
  speedHighScore: number;
  badges: string[]; // badge ids
}

export type ActiveTab = 'adventure' | 'speed_race' | 'manipulatives' | 'achievements';
