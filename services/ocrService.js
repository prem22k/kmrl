import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import { createCanvas, loadImage } from "canvas";

/**
 * Main entry point for OCR processing
 * Returns extracted text from any supported document format
 */
export async function main(filePath) {
  try {
    console.log('\n=== OCR Processing Started ===');
    console.log('File Path:', filePath);
    
    const extractedText = await performOCRAndAnalysis(filePath);
    
    if (!extractedText || extractedText.trim().length < 5) {
      console.log('⚠️ Warning: Minimal text extracted');
      const fileName = path.basename(filePath);
      return `${fileName} - Document uploaded but text extraction yielded minimal content. Using filename for analysis.`;
    }
    
    console.log('✅ Text extraction successful');
    console.log('Extracted Text Length:', extractedText.length, 'characters');
    console.log('Text Preview:', extractedText.substring(0, 300));
    console.log('=== OCR Processing Complete ===\n');
    
    return extractedText;
  } catch (error) {
    console.error('❌ Error in main OCR function:', error.message);
    throw error;
  }
}

/**
 * Performs OCR and text extraction from various document file types
 * For PDFs: Tries direct text extraction first, falls back to OCR if needed
 * For Images: Uses Tesseract OCR
 * For DOCX: Extracts text directly
 * For TXT: Reads file content
 */
export async function performOCRAndAnalysis(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  let textContent = "";

  console.log(`\n📄 Processing ${fileExtension.toUpperCase()} file: ${fileName}`);

  try {
    switch (fileExtension) {
      case ".pdf":
        console.log("🔍 PDF detected - attempting text extraction");
        textContent = await extractTextFromPDF(filePath, fileName);
        break;
        
      case ".jpeg":
      case ".jpg":
      case ".png":
        console.log("🖼️ Image detected - performing OCR");
        textContent = await extractTextFromImage(filePath, fileName);
        break;
        
      case ".docx":
        console.log("📝 DOCX detected - extracting text");
        textContent = await extractTextFromDOCX(filePath, fileName);
        break;
        
      case ".txt":
        console.log("📃 TXT detected - reading content");
        textContent = await extractTextFromTXT(filePath, fileName);
        break;
        
      default:
        console.log(`⚠️ Unsupported file type: ${fileExtension}`);
        textContent = `${fileName} - Unsupported file format ${fileExtension}`;
        break;
    }
  } catch (error) {
    console.error("❌ OCR/Extraction error:", error.message);
    textContent = `${fileName} - Error during text extraction: ${error.message}`;
  }

  return textContent;
}

/**
 * Extract text from PDF - converts to images then uses OCR
 */
async function extractTextFromPDF(filePath, fileName) {
  let textContent = "";
  
  try {
    // Method 1: Try pdf-parse for text-based PDFs
    console.log("Method 1: Trying pdf-parse for text-based PDFs...");
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const pdfBuffer = fs.readFileSync(filePath);
    
    const pdfData = await pdfParse(pdfBuffer, { max: 0 }).catch(err => {
      console.log("pdf-parse failed:", err.message);
      return null;
    });
    
    // Check if we got substantial text (more than just PDF metadata)
    if (pdfData && pdfData.text && pdfData.text.trim().length > 100) {
      // Filter out PDF internal code/metadata
      const cleanedText = pdfData.text
        .replace(/\b(ReportLab|stream|endstream|endobj|obj)\b/gi, '')
        .replace(/<<[^>]*>>/g, '')
        .replace(/\/[A-Z][A-Za-z0-9]*/g, '')
        .trim();
      
      if (cleanedText.length > 50) {
        console.log(`✅ Extracted ${cleanedText.length} characters using pdf-parse`);
        console.log(`📊 PDF has ${pdfData.numpages} pages`);
        return cleanedText;
      }
    }
    
    // Method 2: Convert PDF to images and OCR (for scanned/image-based PDFs)
    console.log("Method 2: Converting PDF to images for OCR...");
    textContent = await convertPDFToImagesAndOCR(filePath, fileName);
    
    if (textContent && textContent.length > 50) {
      return textContent;
    }
    
    // Method 3: Last resort - return informative message
    console.log("⚠️ Could not extract substantial text from PDF");
    const fileSize = (pdfBuffer.length / 1024).toFixed(2);
    return `${fileName} (${fileSize} KB PDF) - This PDF appears to contain minimal readable text. The document may be encrypted, corrupted, or contain primarily images without text.`;
    
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return `${fileName} - PDF processing error: ${error.message}. Please verify the file is not corrupted or password-protected.`;
  }
}

/**
 * Convert PDF pages to images and run OCR on each page
 */
async function convertPDFToImagesAndOCR(filePath, fileName) {
  try {
    // Use pdf-to-pic library to convert PDF to images
    const { fromPath } = await import("pdf-to-pic");
    const tempDir = path.join(path.dirname(filePath), 'temp_pdf_images');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log("🔄 Converting PDF pages to images...");
    
    // Convert PDF to images (one per page)
    const converter = fromPath(filePath, {
      density: 200,           // DPI for image quality
      savePath: tempDir,
      format: "png",
      width: 2000,           // Higher resolution for better OCR
      height: 2000
    });
    
    let allText = "";
    let pageNum = 1;
    
    try {
      // Convert and OCR each page
      for await (const page of converter) {
        console.log(`📄 Processing page ${pageNum}...`);
        
        // Run Tesseract OCR on the image
        const { data: { text } } = await Tesseract.recognize(page.path, "eng", {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`Page ${pageNum} OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
            }
          }
        });
        
        if (text && text.trim().length > 10) {
          allText += text.trim() + "\n\n";
          console.log(`✅ Page ${pageNum}: Extracted ${text.trim().length} characters`);
        }
        
        // Clean up the temporary image file
        try {
          fs.unlinkSync(page.path);
        } catch (cleanupError) {
          console.warn(`Could not delete temp file: ${page.path}`);
        }
        
        pageNum++;
      }
    } catch (conversionError) {
      console.error("PDF to image conversion error:", conversionError.message);
    }
    
    // Clean up temp directory
    try {
      fs.rmdirSync(tempDir, { recursive: true });
    } catch (cleanupError) {
      console.warn("Could not remove temp directory");
    }
    
    if (allText.trim().length > 50) {
      console.log(`✅ Total extracted: ${allText.length} characters from ${pageNum - 1} pages`);
      return allText.trim();
    }
    
    return `${fileName} - PDF processed but minimal text found. The document may contain primarily images or graphics.`;
    
  } catch (error) {
    console.error("PDF to image conversion failed:", error.message);
    // Return a message indicating the method failed
    return null;
  }
}

/**
 * Extract text from images using Tesseract OCR
 */
async function extractTextFromImage(filePath, fileName) {
  try {
    console.log("🔄 Starting Tesseract OCR...");
    
    const { data: { text } } = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
        }
      }
    });
    
    if (text && text.trim().length > 10) {
      console.log(`✅ OCR extracted ${text.length} characters`);
      return text.trim();
    }
    
    console.log("⚠️ OCR extracted minimal text");
    return `${fileName} - Image processed but contains minimal readable text. The image may be unclear, low quality, or contain non-text content.`;
    
  } catch (error) {
    console.error("OCR error:", error.message);
    return `${fileName} - OCR processing failed: ${error.message}`;
  }
}

/**
 * Extract text from DOCX files
 */
async function extractTextFromDOCX(filePath, fileName) {
  try {
    const { value } = await mammoth.extractRawText({ path: filePath });
    
    if (value && value.trim().length > 10) {
      console.log(`✅ Extracted ${value.length} characters from DOCX`);
      return value.trim();
    }
    
    console.log("⚠️ DOCX contains minimal text");
    return `${fileName} - Word document contains minimal text content.`;
    
  } catch (error) {
    console.error("DOCX extraction error:", error.message);
    return `${fileName} - DOCX processing failed: ${error.message}`;
  }
}

/**
 * Extract text from TXT files
 */
async function extractTextFromTXT(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    
    if (content && content.trim().length > 5) {
      console.log(`✅ Read ${content.length} characters from TXT`);
      return content.trim();
    }
    
    console.log("⚠️ TXT file is empty or very short");
    return `${fileName} - Text file is empty or contains minimal content.`;
    
  } catch (error) {
    console.error("TXT reading error:", error.message);
    return `${fileName} - Text file reading failed: ${error.message}`;
  }
}
