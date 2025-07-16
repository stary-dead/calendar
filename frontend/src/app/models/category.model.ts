export interface Category {
  id: number;
  name: string;
  code: 'cat1' | 'cat2' | 'cat3';
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Cat 1', code: 'cat1', color: '#3f51b5' },
  { id: 2, name: 'Cat 2', code: 'cat2', color: '#ff4081' },
  { id: 3, name: 'Cat 3', code: 'cat3', color: '#ff9800' }
];
