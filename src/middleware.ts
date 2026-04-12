import createMiddleware from 'next-intl/middleware';
import {routing} from './navigation';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames starting with a locale prefix
    '/(da|de|el|en|es|fi|fr|it|nl|pt|sv|cs|sk|sl|et|hu|lv|lt|mt|pl|bg|ga|ro|hr)/:path*'
  ]
};
