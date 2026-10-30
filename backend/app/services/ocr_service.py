"""
OCR Service — extracts clean text from images and PDFs.

Pipeline:
  - PDF  → PyMuPDF text extraction (fast) → fallback to page-render + Tesseract
  - Image → Pillow preprocessing (grayscale, denoise, binarize) → Tesseract
"""

import os
import io
import logging
import fitz                          # PyMuPDF
import pytesseract
from PIL import Image, ImageFilter, ImageEnhance

logger = logging.getLogger(__name__)

# -- Tesseract path (optional, defaults to system path in Linux/Docker)
tess_cmd = os.getenv("TESSERACT_CMD")
if tess_cmd and os.path.exists(tess_cmd):
    pytesseract.pytesseract.tesseract_cmd = tess_cmd
elif os.name == 'nt' and not tess_cmd:
    # Common Windows default path for dev convenience
    default_win_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(default_win_path):
        pytesseract.pytesseract.tesseract_cmd = default_win_path

# ── Tesseract config (OEM 3 = LSTM engine, PSM 6 = assume uniform text block)
TESS_CONFIG = "--oem 3 --psm 6"


class OCRService:

    # ──────────────────────────────────────────────
    # Public entry point
    # ──────────────────────────────────────────────
    def extract_text(self, file_bytes: bytes, content_type: str, filename: str) -> str:
        """
        Returns the best-effort extracted text string.
        Logs intermediate results so you can see what was found.
        """
        logger.info(f"[OCR] Starting extraction | file={filename} | type={content_type}")

        content_type = content_type or ""
        filename_lower = filename.lower()

        if "pdf" in content_type or filename_lower.endswith(".pdf"):
            text = self._extract_pdf(file_bytes)
        elif any(filename_lower.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp")):
            text = self._extract_image(file_bytes)
        elif "image" in content_type:
            text = self._extract_image(file_bytes)
        else:
            # Try PDF first, fall back to image
            text = self._extract_pdf(file_bytes)
            if not text.strip():
                text = self._extract_image(file_bytes)

        cleaned = self._clean_text(text)
        logger.info(f"[OCR] Extracted {len(cleaned)} chars")
        logger.debug(f"[OCR] Raw text preview:\n{cleaned[:800]}")
        return cleaned

    # ──────────────────────────────────────────────
    # PDF extraction
    # ──────────────────────────────────────────────
    def _extract_pdf(self, file_bytes: bytes) -> str:
        """Try native text first; render pages with Tesseract if digital text < 50 chars."""
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            native_text = "\n".join(page.get_text() for page in doc)
            logger.info(f"[OCR][PDF] Native text length: {len(native_text)}")

            if len(native_text.strip()) >= 50:
                logger.info("[OCR][PDF] Using native text (no OCR needed)")
                return native_text

            # Scanned PDF — render each page and OCR the image
            logger.info("[OCR][PDF] Native text too short — rendering pages for OCR")
            pages_text = []
            for page_num, page in enumerate(doc):
                mat = fitz.Matrix(2.0, 2.0)          # 2× zoom → ~144 DPI
                pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                img = self._preprocess_image(img)
                page_text = pytesseract.image_to_string(img, config=TESS_CONFIG)
                pages_text.append(page_text)
                logger.info(f"[OCR][PDF] Page {page_num+1}: {len(page_text)} chars")
            return "\n".join(pages_text)
        except Exception as e:
            logger.error(f"[OCR][PDF] Error: {e}")
            return ""

    # ──────────────────────────────────────────────
    # Image extraction
    # ──────────────────────────────────────────────
    def _extract_image(self, file_bytes: bytes) -> str:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img = self._preprocess_image(img)
            text = pytesseract.image_to_string(img, config=TESS_CONFIG)
            logger.info(f"[OCR][IMAGE] Extracted {len(text)} chars from image")
            return text
        except Exception as e:
            logger.error(f"[OCR][IMAGE] Error: {e}")
            return ""

    # ──────────────────────────────────────────────
    # Image preprocessing (sharpens OCR quality)
    # ──────────────────────────────────────────────
    def _preprocess_image(self, img: Image.Image) -> Image.Image:
        """
        1. Convert to grayscale
        2. Upscale to at least 300 DPI equivalent (2× if small)
        3. Enhance contrast
        4. Sharpen
        5. Binarize (Otsu-like threshold via convert)
        """
        # Grayscale
        img = img.convert("L")

        # Upscale small images so Tesseract has enough pixels
        w, h = img.size
        if w < 1500 or h < 1500:
            scale = max(2, 2000 // min(w, h))
            img = img.resize((w * scale, h * scale), Image.LANCZOS)

        # Contrast enhancement
        img = ImageEnhance.Contrast(img).enhance(2.0)

        # Sharpen
        img = img.filter(ImageFilter.SHARPEN)

        # Binarize (keeps thin strokes readable)
        img = img.point(lambda p: 255 if p > 140 else 0, "1").convert("L")

        return img

    # ──────────────────────────────────────────────
    # Text cleanup
    # ──────────────────────────────────────────────
    def _clean_text(self, text: str) -> str:
        """Remove excessive blank lines and strip leading/trailing whitespace."""
        lines = [line.strip() for line in text.splitlines()]
        # Collapse runs of blank lines into one
        cleaned_lines = []
        prev_blank = False
        for line in lines:
            if not line:
                if not prev_blank:
                    cleaned_lines.append("")
                prev_blank = True
            else:
                cleaned_lines.append(line)
                prev_blank = False
        return "\n".join(cleaned_lines).strip()


# ── Singleton
ocr_service = OCRService()
