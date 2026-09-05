import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';
const pixel = Press_Start_2P({weight:'400',subsets:['latin','cyrillic'],variable:'--font-pixel',display:'swap'});
export const metadata: Metadata = {title:'Пицца поровну — калькулятор разреза пиццы',description:'Введи количество гостей и узнай, как разрезать пиццу на равные кусочки: угол, число разрезов и наглядная схема.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru"><body className={pixel.variable}>{children}</body></html>}
