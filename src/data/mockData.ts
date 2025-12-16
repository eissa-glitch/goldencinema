export interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  genre: string[];
  rating: number;
  director: string;
  cast: string[];
  synopsis: string;
  duration: number;
  gallery: string[];
}

export interface Artist {
  id: string;
  name: string;
  photo: string;
  birthYear: number;
  deathYear?: number;
  role: string;
  biography: string;
  filmography: string[];
  gallery: string[];
}

export const movies: Movie[] = [
  {
    id: "1",
    title: "باب الحديد",
    year: 1958,
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
    genre: ["دراما", "رومانسي"],
    rating: 8.5,
    director: "يوسف شاهين",
    cast: ["يوسف شاهين", "هند رستم", "فريد شوقي"],
    synopsis: "قصة قناوي بائع الصحف في محطة القطار الذي يقع في حب هنومة بائعة المرطبات.",
    duration: 77,
    gallery: [
      "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "2",
    title: "الأرض",
    year: 1970,
    poster: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=600&fit=crop",
    genre: ["دراما"],
    rating: 8.8,
    director: "يوسف شاهين",
    cast: ["محمود المليجي", "عزت العلايلي", "نجوى إبراهيم"],
    synopsis: "صراع الفلاحين المصريين للحفاظ على أرضهم ضد الإقطاع والاستعمار.",
    duration: 130,
    gallery: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "3",
    title: "الناصر صلاح الدين",
    year: 1963,
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    genre: ["تاريخي", "ملحمي"],
    rating: 8.2,
    director: "يوسف شاهين",
    cast: ["أحمد مظهر", "صلاح ذو الفقار", "ليلى فوزي"],
    synopsis: "ملحمة تاريخية عن صلاح الدين الأيوبي وتحرير القدس.",
    duration: 175,
    gallery: [
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "4",
    title: "إسكندرية ليه",
    year: 1979,
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
    genre: ["دراما", "سيرة ذاتية"],
    rating: 8.0,
    director: "يوسف شاهين",
    cast: ["محسن محيي الدين", "نجلاء فتحي", "فريد شوقي"],
    synopsis: "قصة شاب مصري يحلم بالسفر لهوليوود خلال الحرب العالمية الثانية.",
    duration: 133,
    gallery: [
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "5",
    title: "شيء من الخوف",
    year: 1969,
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
    genre: ["دراما", "رومانسي"],
    rating: 8.3,
    director: "حسين كمال",
    cast: ["شادية", "محمود مرسي", "يحيى شاهين"],
    synopsis: "قصة فتاة ترفض الزواج من طاغية القرية.",
    duration: 120,
    gallery: [
      "https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1464852045489-bccb7d17fe39?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "6",
    title: "المومياء",
    year: 1969,
    poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    genre: ["دراما", "تاريخي"],
    rating: 8.7,
    director: "شادي عبد السلام",
    cast: ["أحمد مرعي", "زوزو حمدي الحكيم", "نادية لطفي"],
    synopsis: "قصة قبيلة تعيش على سرقة الآثار وصراع أحد أبنائها مع ضميره.",
    duration: 103,
    gallery: [
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=500&fit=crop",
    ],
  },
];

export const artists: Artist[] = [
  {
    id: "1",
    name: "يوسف شاهين",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    birthYear: 1926,
    deathYear: 2008,
    role: "مخرج",
    biography: "مخرج مصري من أعظم المخرجين في تاريخ السينما العربية والعالمية.",
    filmography: ["1", "2", "3", "4"],
    gallery: [
      "https://images.unsplash.com/photo-1559090845-acae4e05a2d3?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "2",
    name: "فاتن حمامة",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
    birthYear: 1931,
    deathYear: 2015,
    role: "ممثلة",
    biography: "سيدة الشاشة العربية، من أعظم الممثلات في تاريخ السينما المصرية.",
    filmography: [],
    gallery: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "3",
    name: "عمر الشريف",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
    birthYear: 1932,
    deathYear: 2015,
    role: "ممثل",
    biography: "نجم عالمي، أول ممثل عربي يحصل على جائزة غولدن غلوب.",
    filmography: [],
    gallery: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "4",
    name: "هند رستم",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
    birthYear: 1929,
    deathYear: 2011,
    role: "ممثلة",
    biography: "مارلين مونرو الشرق، من أشهر نجمات السينما المصرية.",
    filmography: ["1"],
    gallery: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "5",
    name: "أحمد زكي",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
    birthYear: 1949,
    deathYear: 2005,
    role: "ممثل",
    biography: "إمبراطور السينما المصرية، من أعظم الممثلين العرب.",
    filmography: [],
    gallery: [
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=800&h=500&fit=crop",
    ],
  },
  {
    id: "6",
    name: "شادية",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
    birthYear: 1931,
    deathYear: 2017,
    role: "ممثلة ومغنية",
    biography: "دلوعة السينما المصرية، نجمة استثنائية في التمثيل والغناء.",
    filmography: ["5"],
    gallery: [
      "https://images.unsplash.com/photo-1523264653568-d3d4042f4e45?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=500&fit=crop",
    ],
  },
];

export const years = [1950, 1955, 1960, 1963, 1965, 1969, 1970, 1975, 1979, 1980, 1985, 1990, 1995, 2000, 2005, 2010];

export const genres = ["دراما", "كوميديا", "رومانسي", "أكشن", "تاريخي", "ملحمي", "موسيقي", "رعب", "غموض"];
