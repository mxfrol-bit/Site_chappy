import type { Trend } from '../types';

export const trendCategories = [
  'Популярные', 'Новые', 'Видео', 'Фото', 'Аватары', 'Ретро', 'Экшн', 'Аниме',
];

export const trends: Trend[] = [
  { id: 'kino', title: 'Кино-афиша', category: 'Популярные', modality: 'image', image: '/trends/kino.jpg', steps: 2, priceFrom: 8, tags: ['постер', 'кино', 'портрет'] },
  { id: 'anime', title: 'Аниме-образ', category: 'Аниме', modality: 'image', image: '/trends/anime.jpg', steps: 2, priceFrom: 6, tags: ['аниме', 'стиль'] },
  { id: 'gothic', title: 'Готик-нуар', category: 'Фото', modality: 'image', image: '/trends/gothic.jpg', steps: 2, priceFrom: 7, tags: ['нуар', 'драма'] },
  { id: 'spacecat', title: 'Космо-питомец', category: 'Популярные', modality: 'image', image: '/trends/spacecat.jpg', steps: 1, priceFrom: 5, tags: ['фан', 'питомец'] },
  { id: 'cyber', title: 'Киберпанк', category: 'Видео', modality: 'video', image: '/trends/cyber.jpg', steps: 3, priceFrom: 30, tags: ['неон', 'город', 'видео'] },
  { id: 'neon', title: 'Неон-портрет', category: 'Новые', modality: 'image', image: '/trends/neon.jpg', steps: 2, priceFrom: 7, tags: ['неон', 'портрет'] },
  { id: 'future', title: 'Футуризм', category: 'Видео', modality: 'video', image: '/trends/future.jpg', steps: 3, priceFrom: 32, tags: ['sci-fi', 'видео'] },
  { id: 'retro', title: 'Ретро 90-х', category: 'Ретро', modality: 'image', image: '/trends/retro.jpg', steps: 2, priceFrom: 6, tags: ['ретро', 'плёнка'] },
  { id: 'fashion', title: 'Fashion-съёмка', category: 'Фото', modality: 'image', image: '/trends/fashion.jpg', steps: 2, priceFrom: 9, tags: ['мода', 'студия'] },
  { id: 'sport', title: 'Спорт-экшн', category: 'Экшн', modality: 'image', image: '/trends/sport.jpg', steps: 2, priceFrom: 8, tags: ['экшн', 'динамика'] },
  { id: 'star', title: 'Как звезда', category: 'Популярные', modality: 'image', image: '/trends/star.jpg', steps: 2, priceFrom: 8, tags: ['гламур', 'портрет'] },
  { id: 'dance', title: 'Танец-рил', category: 'Видео', modality: 'video', image: '/trends/dance.jpg', steps: 3, priceFrom: 28, tags: ['танец', 'reels'] },
  { id: 'avatar', title: 'AI-аватар канала', category: 'Аватары', modality: 'image', image: '/trends/avatar.jpg', steps: 2, priceFrom: 6, tags: ['аватар', 'бренд'] },
];

export const getTrend = (id: string) => trends.find((t) => t.id === id);
