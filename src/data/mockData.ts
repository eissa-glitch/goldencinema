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
  },
];

export const years = [1950, 1955, 1960, 1963, 1965, 1969, 1970, 1975, 1979, 1980, 1985, 1990, 1995, 2000, 2005, 2010];

export const genres = ["دراما", "كوميديا", "رومانسي", "أكشن", "تاريخي", "ملحمي", "موسيقي", "رعب", "غموض"];
