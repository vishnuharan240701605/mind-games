/* ==========================================
   FOOTER COMPONENT
   ========================================== */

export function renderFooter() {
    const footer = document.getElementById('app-footer');
    if (!footer) return;

    footer.innerHTML = `
    <div class="footer">
      <div class="footer-inner">
        <div class="footer-text">
          <span>🧠</span> MindGames © ${new Date().getFullYear()} — Train Your Brain
        </div>
        <div class="footer-text">
          Built with ❤️ for curious minds
        </div>
      </div>
    </div>
  `;
}
