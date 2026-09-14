type BackRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: '/') => void;
};

export function goHome(router: BackRouter) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}
