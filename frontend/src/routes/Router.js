import React, { useState, useEffect } from 'react';

function getPath() {
  return window.location.pathname;
}

export function Router({ routes }) {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onPopState = () => setPath(getPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const RouteComponent = routes[path] || routes['*'];
  return RouteComponent ? <RouteComponent /> : null;
}

export function navigate(to) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event('popstate'));
}
