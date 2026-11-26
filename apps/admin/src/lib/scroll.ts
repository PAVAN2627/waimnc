export function scrollAdminToTop(el?: HTMLElement | null) {
  setTimeout(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 60);
}
