// === MODAL / LIGHTBOX SYSTEM ===
let modalFiles = [];
let modalIndex = 0;

function openFileModal(files, index) {
  modalFiles = files;
  modalIndex = index || 0;
  renderModal();
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const el = document.getElementById("fileModal");
  if (el) el.remove();
  document.body.style.overflow = "";
  modalFiles = [];
}

function modalPrev() {
  if (modalIndex > 0) { modalIndex--; renderModal(); }
}

function modalNext() {
  if (modalIndex < modalFiles.length - 1) { modalIndex++; renderModal(); }
}

function renderModal() {
  let el = document.getElementById("fileModal");
  if (!el) {
    el = document.createElement("div");
    el.id = "fileModal";
    document.body.appendChild(el);
  }

  const f = modalFiles[modalIndex];
  if (!f) { closeModal(); return; }

  const info = driveFileInfo(f.mimeType);
  const isImage = f.mimeType?.startsWith("image/");
  const isPDF = f.mimeType === "application/pdf";
  const isDoc = f.mimeType === "application/vnd.google-apps.document";
  const isSheet = f.mimeType === "application/vnd.google-apps.spreadsheet";
  const isSlides = f.mimeType === "application/vnd.google-apps.presentation";
  const isVideo = f.mimeType?.startsWith("video/");
  const isGoogleNative = isDoc || isSheet || isSlides;
  const driveLink = f.webViewLink || "#";
  const hasPrev = modalIndex > 0;
  const hasNext = modalIndex < modalFiles.length - 1;
  const counter = modalFiles.length > 1 ? `${modalIndex + 1} / ${modalFiles.length}` : "";

  // Build preview content
  let preview = "";
  if (isImage) {
    // Use Drive thumbnail at high res, or webContentLink
    const imgUrl = f.thumbnailLink
      ? f.thumbnailLink.replace(/=s\d+/, "=s1200")
      : `https://drive.google.com/uc?id=${f.id}&export=view`;
    preview = `<img src="${imgUrl}" class="max-w-full max-h-[75vh] object-contain rounded-xl" alt="${f.name}" onerror="this.src='https://drive.google.com/uc?id=${f.id}&export=view'"/>`;
  } else if (isPDF || isGoogleNative) {
    // Embed Google Drive viewer
    const embedUrl = isGoogleNative
      ? `https://docs.google.com/gview?url=https://docs.google.com/document/d/${f.id}/export?format=pdf&embedded=true`
      : `https://drive.google.com/file/d/${f.id}/preview`;
    const viewerUrl = isDoc
      ? `https://docs.google.com/document/d/${f.id}/preview`
      : isSheet
      ? `https://docs.google.com/spreadsheets/d/${f.id}/preview`
      : isSlides
      ? `https://docs.google.com/presentation/d/${f.id}/preview`
      : `https://drive.google.com/file/d/${f.id}/preview`;
    preview = `<iframe src="${viewerUrl}" class="w-full h-[75vh] rounded-xl border-0" allowfullscreen></iframe>`;
  } else if (isVideo) {
    preview = `<iframe src="https://drive.google.com/file/d/${f.id}/preview" class="w-full h-[75vh] rounded-xl border-0" allowfullscreen></iframe>`;
  } else {
    // Fallback: show file info with link
    preview = `<div class="flex flex-col items-center justify-center py-16 gap-4">
      <span class="material-symbols-outlined text-6xl" style="color:${info.color}">${info.icon}</span>
      <p class="text-lg font-bold text-on-surface">${f.name}</p>
      <p class="text-sm text-on-surface-variant">${info.label}${f.size ? " • " + formatFileSize(f.size) : ""}</p>
      <a href="${driveLink}" target="_blank" rel="noopener" class="bg-velvet text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform text-sm">
        <span class="material-symbols-outlined text-lg">open_in_new</span>${t("modal.open_drive")}
      </a>
    </div>`;
  }

  el.className = "fixed inset-0 z-[100] flex items-center justify-center";
  el.innerHTML = `
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeModal()"></div>
    <!-- Modal Content -->
    <div class="relative z-10 w-full max-w-5xl mx-4 max-h-[95vh] flex flex-col">
      <!-- Top bar -->
      <div class="flex items-center justify-between bg-white/95 backdrop-blur-md rounded-t-2xl px-5 py-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-symbols-outlined text-xl" style="color:${info.color}">${info.icon}</span>
          <div class="min-w-0">
            <p class="text-sm font-bold text-on-surface truncate">${f.name}</p>
            <p class="text-[10px] text-on-surface-variant">${info.label}${f.size ? " • " + formatFileSize(f.size) : ""}${counter ? " • " + counter : ""}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <a href="${driveLink}" target="_blank" rel="noopener" class="text-xs font-bold text-river-blue bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">open_in_new</span>${t("modal.open_drive")}
          </a>
          <button onclick="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <!-- Preview Area -->
      <div class="bg-gray-900 rounded-b-2xl flex items-center justify-center p-2 relative overflow-hidden min-h-[300px]">
        ${preview}
        ${hasPrev ? `<button onclick="event.stopPropagation();modalPrev()" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"><span class="material-symbols-outlined">chevron_left</span></button>` : ""}
        ${hasNext ? `<button onclick="event.stopPropagation();modalNext()" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"><span class="material-symbols-outlined">chevron_right</span></button>` : ""}
      </div>
    </div>`;

  // Keyboard navigation
  el.onkeydown = null;
  document.onkeydown = function(e) {
    if (!document.getElementById("fileModal")) { document.onkeydown = null; return; }
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") modalPrev();
    if (e.key === "ArrowRight") modalNext();
  };
}
