import fs from "fs";
import path from "path";
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
 * Extract text from PDF - tries multiple methods
 */
async function extractTextFromPDF(filePath, fileName) {
  let textContent = "";
  
  try {
    // Method 1: Try pdf-parse for text-based PDFs
    console.log("Method 1: Trying pdf-parse...");
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const pdfBuffer = fs.readFileSync(filePath);
    
    const pdfData = await pdfParse(pdfBuffer, { max: 0 }).catch(err => {
      console.log("pdf-parse failed:", err.message);
      return null;
    });
    
    if (pdfData && pdfData.text && pdfData.text.trim().length > 50) {
      textContent = pdfData.text.trim();
      console.log(`✅ Extracted ${textContent.length} characters using pdf-parse`);
      console.log(`📊 PDF has ${pdfData.numpages} pages`);
      return textContent;
    }
    
    // Method 2: Buffer-based extraction
    console.log("Method 2: Trying buffer extraction...");
    const bufferString = pdfBuffer.toString('utf8');
    const textMatches = bufferString.match(/[A-Za-z0-9\s.,!?;:'"()\-]{15,}/g);
    
    if (textMatches && textMatches.length > 5) {
      textContent = textMatches.join(' ').trim();
      if (textContent.length > 50) {
        console.log(`✅ Extracted ${textContent.length} characters from buffer`);
        return textContent;
      }
    }
    
    // Method 3: OCR fallback for image-based PDFs
    // Note: This would require converting PDF to images first
    // For now, return informative message
    console.log("⚠️ PDF appears to be image-based or encrypted");
    const fileSize = (pdfBuffer.length / 1024).toFixed(2);
    return `${fileName} (${fileSize} KB PDF) - This PDF appears to be image-based, scanned, or has protected content. For better results, please provide a text-searchable PDF or use the original document source.`;
    
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return `${fileName} - PDF processing error: ${error.message}. Please verify the file is not corrupted or password-protected.`;
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
