export type Language = 'vi' | 'en' | 'bilingual';

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

export interface MathVocabItem {
  vi: string;
  en: string;
  pronounceEn?: string;
  category: string;
  noteVi?: string;
  noteEn?: string;
  exampleVi?: string;
  exampleEn?: string;
}

export interface MathQuestion {
  id: string;
  topicId: string;
  title: string;
  titleEn?: string;
  promptText: string; // Câu hỏi tiếng Việt
  promptTextEn?: string; // English question prompt
  speechText: string; // Nội dung đọc tiếng Việt
  speechTextEn?: string; // English speech text
  equation?: string; // Ví dụ: 35 + 28 = ?
  options: (string | number)[];
  optionsEn?: (string | number)[];
  correctAnswer: string | number;
  explanation: string;
  explanationEn?: string;
  hint: string;
  hintEn?: string;
  visualAid?: VisualAidData;
  textbookRef?: string; // e.g. "Toán 2 - Kết nối tri thức - Bài 7"
  keyVocab?: MathVocabItem[]; // Thuật ngữ SGK liên quan
}

export interface LevelInfo {
  id: string;
  islandId: string;
  levelNumber: number;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  textbookLesson?: string; // e.g. "Chủ đề 2: Phép cộng (qua 10) trong phạm vi 20"
  textbookLessonEn?: string;
  requiredStarsToUnlock: number;
  questions: MathQuestion[];
}

export interface IslandInfo {
  id: string;
  title: string;
  titleEn: string;
  themeColor: string;
  accentBg: string;
  icon: string;
  description: string;
  descriptionEn: string;
  textbookChapter: string; // Tên Chủ đề chuẩn SGK Kết nối tri thức với cuộc sống
  textbookChapterEn: string;
  levels: LevelInfo[];
}

export interface Badge {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
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
  marioHighScore?: number;
  badges: string[]; // badge ids
}

export type ActiveTab = 'adventure' | 'speed_race' | 'mario_run' | 'manipulatives' | 'achievements' | 'vocabulary';
