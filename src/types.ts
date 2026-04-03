export interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface RecognitionResult {
  text: string;
  value: number;
}

export const DEFAULT_PRICES = {
  idly: 10,
  vadai: 8,
  puri: 25,
};

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'idly',
    name: 'Idly',
    price: DEFAULT_PRICES.idly,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'vadai',
    name: 'Vadai',
    price: DEFAULT_PRICES.vadai,
    image: 'https://images.unsplash.com/photo-1626132646529-500637532537?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'puri',
    name: 'Puri',
    price: DEFAULT_PRICES.puri,
    image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=400&h=400&q=80',
  },
];
