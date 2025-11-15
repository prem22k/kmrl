export async function categorizeDocument(textContent, fileName = '') {
  console.log('=== Categorization Started ===');
  console.log('Text Content Length:', textContent.length);
  console.log('File Name:', fileName);
  console.log('Text Preview:', textContent.substring(0, 200));
  
  // Check if text extraction failed
  const isFailedExtraction = textContent.includes('parsing failed') || 
                            textContent.includes('processing failed') ||
                            textContent.includes('minimal') ||
                            textContent.length < 50;
  
  if (isFailedExtraction) {
    console.log('⚠️ Text extraction appears to have failed, using filename-based analysis');
    return analyzeFromFilename(fileName);
  }
  
  // First, get AI analysis with structured JSON output
  const aiResult = await getStructuredAIAnalysis(textContent, fileName);
  console.log('AI Result:', aiResult);
  
  // Apply backend keyword validation to override obvious mislabels
  const validatedResult = validateAndOverrideCategories(textContent, fileName, aiResult);
  console.log('Validated Result:', validatedResult);
  
  // Apply rule-based priority detection
  const finalPriority = getRuleBasedPriority(textContent, validatedResult.priority);
  console.log('Final Priority:', finalPriority);
  console.log('=== Categorization Complete ===\n');
  
  return {
    category: validatedResult.category,
    priority: finalPriority,
    analysis: validatedResult.analysis
  };
}

// New function to analyze based on filename when text extraction fails
function analyzeFromFilename(fileName) {
  console.log('Analyzing from filename:', fileName);
  const lowerFileName = fileName.toLowerCase();
  
  // Category detection from filename
  const filenameCategories = {
    'Engineering': ['maintenance', 'repair', 'technical', 'equipment', 'infrastructure', 'construction', 'mech', 'elect', 'system', 'work', 'project'],
    'Finance': ['budget', 'payment', 'invoice', 'expense', 'cost', 'revenue', 'financial', 'account', 'bill', 'fund'],
    'Procurement': ['purchase', 'vendor', 'supplier', 'tender', 'quotation', 'contract', 'rfp', 'procurement', 'order'],
    'HR': ['employee', 'staff', 'personnel', 'recruitment', 'training', 'leave', 'hr', 'attendance', 'salary'],
    'Legal': ['legal', 'contract', 'agreement', 'compliance', 'regulation', 'law', 'audit', 'policy'],
    'Safety': ['safety', 'security', 'emergency', 'incident', 'accident', 'hazard', 'risk', 'circular', 'alert'],
    'Regulatory': ['regulatory', 'government', 'ministry', 'notification', 'directive', 'guideline', 'rule', 'standard']
  };
  
  // Priority keywords in filename
  const highPriorityKeywords = ['urgent', 'immediate', 'emergency', 'critical', 'asap'];
  const mediumPriorityKeywords = ['important', 'attention', 'notice', 'reminder'];
  
  let detectedCategory = 'Other';
  let maxMatches = 0;
  
  // Find best matching category
  for (const [category, keywords] of Object.entries(filenameCategories)) {
    const matches = keywords.filter(keyword => lowerFileName.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = category;
    }
  }
  
  // Detect priority from filename
  let priority = 'Low';
  if (highPriorityKeywords.some(kw => lowerFileName.includes(kw))) {
    priority = 'High';
  } else if (mediumPriorityKeywords.some(kw => lowerFileName.includes(kw)) || maxMatches > 0) {
    priority = 'Medium';
  }
  
  // Generate appropriate summary
  const summary = maxMatches > 0 
    ? `${detectedCategory} document identified from filename: "${fileName}". Content extraction unsuccessful - manual review recommended for detailed analysis.`
    : `Document "${fileName}" has been uploaded. Content extraction was unsuccessful - please review the original file for details.`;
  
  console.log('Filename-based result:', { detectedCategory, priority, summary });
  
  return {
    category: detectedCategory,
    priority: priority,
    analysis: summary
  };
}

async function getStructuredAIAnalysis(textContent, fileName) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const structuredPrompt = `
Analyze the following document text and provide a structured JSON response with EXACTLY these fields:

Document Text: "${textContent.substring(0, 2000)}"
File Name: "${fileName}"

You must respond with ONLY a valid JSON object in this exact format:
{
  "category": "one of: Engineering, Finance, Procurement, HR, Legal, Safety, Regulatory, Other",
  "priority": "one of: High, Medium, Low",
  "summary": "A factual 2-3 sentence summary based STRICTLY on the actual document content. Do not add generic statements or assumptions. Only describe what is explicitly mentioned in the text."
}

Rules:
1. Base your analysis ONLY on the actual text content provided
2. Do not make assumptions or add generic information
3. The summary must reflect specific content from the document
4. Use exact category names from the list
5. Priority should be based on urgency indicators in the text
6. Respond with ONLY the JSON object, no other text
`;

    const result = await model.generateContent(structuredPrompt);
    const response = result.response.text();
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      return {
        category: parsedResult.category || 'Other',
        priority: parsedResult.priority || 'Low',
        summary: parsedResult.summary || 'Document processed for categorization.'
      };
    }
  } catch (error) {
    console.log('AI analysis failed, using fallback:', error.message);
  }
  
  // Fallback to basic analysis
  return {
    category: 'Other',
    priority: 'Low',
    summary: `Document contains ${textContent.split(' ').length} words and has been processed for review.`
  };
}

function validateAndOverrideCategories(textContent, fileName, aiResult) {
  const lowerText = textContent.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  // Strong keyword overrides for obvious mislabels
  const categoryKeywords = {
    'Engineering': ['maintenance', 'repair', 'technical', 'equipment', 'infrastructure', 'construction', 'mechanical', 'electrical', 'system'],
    'Finance': ['budget', 'payment', 'invoice', 'expense', 'cost', 'revenue', 'financial', 'accounting'],
    'Procurement': ['purchase', 'vendor', 'supplier', 'tender', 'quotation', 'contract award', 'rfp', 'procurement'],
    'HR': ['employee', 'staff', 'personnel', 'recruitment', 'training', 'leave', 'human resource', 'hr'],
    'Legal': ['legal', 'contract', 'agreement', 'compliance', 'regulation', 'law', 'litigation', 'audit'],
    'Safety': ['safety', 'security', 'emergency', 'incident', 'accident', 'hazard', 'risk', 'protocol'],
    'Regulatory': ['regulatory', 'government', 'ministry', 'policy', 'circular', 'notification', 'directive', 'guideline']
  };
  
  // Count keyword matches for each category
  let bestCategory = aiResult.category;
  let maxMatches = 0;
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => 
      lowerText.includes(keyword) || lowerFileName.includes(keyword)
    ).length;
    
    if (matches > maxMatches && matches >= 2) { // Require at least 2 keyword matches
      maxMatches = matches;
      bestCategory = category;
    }
  }
  
  return {
    category: bestCategory,
    priority: aiResult.priority,
    analysis: aiResult.summary
  };
}

function getRuleBasedPriority(textContent, aiPriority) {
  const lowerText = textContent.toLowerCase();
  
  // High priority indicators
  const highPriorityKeywords = [
    'urgent', 'immediate', 'emergency', 'critical', 'deadline', 'asap',
    'action required', 'time sensitive', 'priority', 'escalate'
  ];
  
  // Medium priority indicators
  const mediumPriorityKeywords = [
    'important', 'attention', 'review required', 'follow up', 'notice',
    'update', 'reminder', 'please note'
  ];
  
  // Check for high priority indicators
  const hasHighPriority = highPriorityKeywords.some(keyword => lowerText.includes(keyword));
  if (hasHighPriority) {
    return 'High';
  }
  
  // Check for medium priority indicators
  const hasMediumPriority = mediumPriorityKeywords.some(keyword => lowerText.includes(keyword));
  if (hasMediumPriority) {
    return 'Medium';
  }
  
  // Default to AI suggestion or Low
  return aiPriority || 'Low';
}
