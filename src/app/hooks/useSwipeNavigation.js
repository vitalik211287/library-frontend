import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { swipeNavigationPaths } from "../../shared/components/AppNavigation/navigationItems.js";

const SWIPE_DISTANCE = 70;
const DIRECTION_RATIO = 1.25;
const EDGE_GUARD = 24;
const MOBILE_BREAKPOINT = 1024;

const isSwipeBlockedTarget = (target) => {
  if (!(target instanceof Element)) {
    return false;
  }

  if (
    target.closest(
      [
        "input",
        "textarea",
        "select",
        "button",
        "a",
        "[role='button']",
        "[role='dialog']",
        "[data-swipe-ignore]",
        ".modal",
        ".mobile-drawer",
      ].join(","),
    )
  ) {
    return true;
  }

  let element = target;

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const canScrollHorizontally =
      ["auto", "scroll"].includes(style.overflowX) &&
      element.scrollWidth > element.clientWidth;

    if (canScrollHorizontally) {
      return true;
    }

    element = element.parentElement;
  }

  return false;
};

const useSwipeNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`,
    );

    let startX = null;
    let startY = null;
    let blocked = false;

    const resetGesture = () => {
      startX = null;
      startY = null;
      blocked = false;
    };

    const handleTouchStart = (event) => {
      if (!mediaQuery.matches || event.touches.length !== 1) {
        resetGesture();
        return;
      }

      const touch = event.touches[0];

      if (
        touch.clientX <= EDGE_GUARD ||
        touch.clientX >= window.innerWidth - EDGE_GUARD
      ) {
        resetGesture();
        return;
      }

      blocked = isSwipeBlockedTarget(event.target);

      if (blocked) {
        return;
      }

      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleTouchEnd = (event) => {
      if (
        blocked ||
        startX === null ||
        startY === null ||
        !mediaQuery.matches ||
        event.changedTouches.length !== 1
      ) {
        resetGesture();
        return;
      }

      const touch = event.changedTouches[0];

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      resetGesture();

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (
        absX < SWIPE_DISTANCE ||
        absX <= absY * DIRECTION_RATIO
      ) {
        return;
      }

      const currentIndex = swipeNavigationPaths.indexOf(
        location.pathname,
      );

      if (currentIndex === -1) {
        return;
      }

      const nextIndex =
        deltaX < 0
          ? currentIndex + 1
          : currentIndex - 1;

      if (
        nextIndex < 0 ||
        nextIndex >= swipeNavigationPaths.length
      ) {
        return;
      }

      navigate(swipeNavigationPaths[nextIndex]);
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    document.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [location.pathname, navigate]);
};

export default useSwipeNavigation;
