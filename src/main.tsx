import { createRoot } from 'react-dom/client';
import PortfolioPage from '@/components/portfolio-page';
import '@/app/globals.css';
const route = window.location.pathname.replace(/\/+$/, '') || '/';
const pages = { '/': 'home', '/projects': 'projects', '/approach': 'approach', '/about': 'about' } as const;
const page = pages[route as keyof typeof pages];
createRoot(document.getElementById('root')!).render(page ? <PortfolioPage page={page}/> : <main style={{padding:40}}><h1>Page not found</h1><a href="/">Return home</a></main>);
