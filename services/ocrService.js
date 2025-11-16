import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";

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
 * Extract text from PDF - tries multiple methods including PDF-to-Image-to-OCR
 */
async function extractTextFromPDF(filePath, fileName) {
  let textContent = "";
  
  try {
    // Method 1: Try pdf-parse for text-based PDFs
    console.log("Method 1: Trying pdf-parse for text-based PDFs...");
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const pdfBuffer = fs.readFileSync(filePath);
    
    const pdfData = await pdfParse(pdfBuffer, { max: 0 }).catch(err => {
      console.log("pdf-parse error:", err.message);
      return null;
    });
    
    if (pdfData && pdfData.text && pdfData.text.trim().length > 100) {
      // Check if text contains PDF metadata keywords (indicates bad extraction)
      const hasPDFMetadata = /\b(ReportLab|endobj|endstream|stream\s*\n|\/Type\s*\/Page|\/Filter|\/Length)/i.test(pdfData.text);
      
      if (!hasPDFMetadata) {
        textContent = pdfData.text.trim();
        console.log(`✅ Extracted ${textContent.length} characters using pdf-parse`);
        console.log(`📊 PDF has ${pdfData.numpages} pages`);
        return textContent;
      } else {
        console.log("⚠️ PDF metadata detected - switching to image-based OCR");
      }
    }
    
    // Method 2: PDF-to-Image-to-OCR for scanned/image-based PDFs
    console.log("Method 2: Converting PDF to images for OCR...");
    textContent = await convertPDFToImagesAndOCR(filePath, fileName);
    
    if (textContent && textContent.length > 50) {
      console.log(`✅ Successfully extracted ${textContent.length} characters via OCR`);
      return textContent;
    }
    
    // Method 3: Fallback message
    console.log("⚠️ PDF processing incomplete");
    const fileSize = (pdfBuffer.length / 1024).toFixed(2);
    return `${fileName} (${fileSize} KB PDF) - Content extraction unsuccessful. This PDF may contain minimal readable text, be encrypted, or contain primarily images.`;
    
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return `${fileName} - PDF processing error: ${error.message}`;
  }
}

/**
 * Convert PDF pages to images and run Tesseract OCR on each page
 */
async function convertPDFToImagesAndOCR(filePath, fileName) {
  const tempDir = path.join(path.dirname(filePath), `temp_ocr_${Date.now()}`);
  
  try {
    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`📁 Created temp directory for images`);
    
    const outputPrefix = path.join(tempDir, 'page');
    let imageFiles = [];
    
    // Try pdftoppm (poppler-utils) first - usually available on Linux
    try {
      console.log("🔄 Attempting pdftoppm conversion...");
      execSync(`pdftoppm -png -r 200 "${filePath}" "${outputPrefix}"`, {
        stdio: 'pipe',
        timeout: 60000 // 60 second timeout
      });
      
      // Find generated PNG files
      imageFiles = fs.readdirSync(tempDir)
        .filter(file => file.endsWith('.png'))
        .sort()
        .map(file => path.join(tempDir, file));
      
      console.log(`✅ pdftoppm generated ${imageFiles.length} page images`);
      
    } catch (popplerError) {
      console.log("⚠️ pdftoppm not available, trying pdf-to-pic library...");
      
      // Fallback to pdf-to-pic library
      try {
        const { fromPath } = await import("pdf-to-pic");
        
        const converter = fromPath(filePath, {
          density: 200,
          savePath: tempDir,
          format: "png",
          width: 2000,
          height: 2000
        });
        
        let pageNum = 1;
        for await (const page of converter) {
          imageFiles.push(page.path);
          console.log(`📄 Converted page ${pageNum}`);
          pageNum++;
        }
        
        console.log(`✅ pdf-to-pic generated ${imageFiles.length} page images`);
        
      } catch (libError) {
        console.error("❌ Both pdftoppm and pdf-to-pic failed");
        throw new Error("PDF to image conversion not available");
      }
    }
    
    if (imageFiles.length === 0) {
      console.log("⚠️ No images generated from PDF");
      return "";
    }
    
    // Run Tesseract OCR on each image
    console.log(`🔍 Running OCR on ${imageFiles.length} pages...`);
    let allText = "";
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i];
      console.log(`📄 OCR Page ${i + 1}/${imageFiles.length}...`);
      
      try {
        const { data: { text } } = await Tesseract.recognize(imagePath, "eng", {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress % 0.25 < 0.01) {
              console.log(`   ${(m.progress * 100).toFixed(0)}% complete`);
            }
          }
        });
        
        if (text && text.trim().length > 10) {
          allText += text.trim() + "\n\n";
          console.log(`   ✅ Extracted ${text.trim().length} characters`);
        }
      } catch (ocrError) {
        console.error(`   ❌ OCR failed for page ${i + 1}`);
      }
      
      // Clean up image immediately
      try {
        fs.unlinkSync(imagePath);
      } catch (e) { /* ignore */ }
    }
    
    console.log(`\n✅ Total: ${allText.length} characters from ${imageFiles.length} pages`);
    return allText.trim();
    
  } catch (error) {
    console.error("❌ PDF to image OCR failed:", error.message);
    return "";
  } finally {
    // Clean up temp directory
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir, { recursive: true });
      }
    } catch (e) { /* ignore */ }
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
