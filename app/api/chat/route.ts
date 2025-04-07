import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Finance keywords for topic detection
const FINANCE_KEYWORDS = [
  'invest', 'stock', 'bond', 'portfolio', 'retirement', '401k', 'ira',
  'roth', 'mutual fund', 'etf', 'index fund', 'dividend', 'yield',
  'asset allocation', 'diversification', 'risk tolerance', 'bear market',
  'bull market', 'capital gains', 'compound interest', 'dollar cost averaging',
  'emergency fund', 'inflation', 'liquidity', 'market cap', 'recession',
  'roi', 'volatility', 'tax loss harvesting', 'annuity', 'balance sheet',
  'blue chip', 'brokerage', 'debt', 'equity', 'fidelity', 'hedge fund',
  'interest rate', 'margin', 'net worth', 'option', 'p/e ratio', 'quantitative easing',
  'reit', 'sec', 'treasury', 'valuation', 'wealth', 'yield curve', 'crypto',
  'bitcoin', 'blockchain', 'nft', 'token', 'ico', 'defi', 'stablecoin',
  'budget', 'saving', 'loan', 'mortgage', 'credit', 'interest', 'tax',
  'insurance', 'estate', 'college fund', 'financial planning', 'wealth management',
  'market share', 'market cap', 'cryptocurrency', 'exchange', 'trading'
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Check if it's finance related
    const isFinanceQuestion = (prompt: string): boolean => {
      const cleanPrompt = prompt.toLowerCase().trim();
      
      // Direct keyword match
      const hasKeyword = FINANCE_KEYWORDS.some(keyword => 
        cleanPrompt.includes(keyword)
      );
      
      // Question patterns related to finance
      const financePatterns = [
        /\b(how|what|where|when|why|which|should)\b.*\b(invest|save|budget|money|finance|stock|fund|market|crypto|bitcoin|nft|trade)\b/i,
        /\b(best|top|recommended)\b.*\b(stock|etf|fund|investment|crypto|bond)\b/i,
        /\b(investment|financial|money|cash|dollar|euro|crypto|market)\b.*\b(advice|strategy|tip|plan|option)\b/i,
        /\b(buy|sell|trade|hold)\b.*\b(stock|share|bond|crypto|nft|token)\b/i,
        /\b(allocation|portfolio|diversification|age)\b/i
      ];
      
      return hasKeyword || financePatterns.some(pattern => pattern.test(cleanPrompt));
    };

    const isFinanceRelated = isFinanceQuestion(prompt);

    if (!isFinanceRelated) {
      return NextResponse.json({ 
        text: "Sorry, That's Beyond my current capabilities. I'm specifically designed to help with financial topics like investing, saving, budgeting, and wealth management. Could you please ask me something related to personal finance or investing?"
      });
    }

    // Get API key from environment variables
    const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBs3JYlWOGHbH1pNvrDjZgHs3uQ0v7d7v0";

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // FIXED TYPO: Changed 'gemin-2.0-flash' to 'gemini-pro'
    // Using gemini-pro as it's more widely available
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest"
    });
    
    // Create finance-specific prompt
    const financialPrompt = `You are FinAnswer, a specialized financial AI assistant. Only give answers about investing and finance related prompts.

User Question: ${prompt}

Important guidelines:
1. Respond in a natural, conversational way
2. Keep responses concise but informative
3. Always provide SPECIFIC answers to user questions
4. Include specific strategies, products, or numerical examples when relevant
5. If asked about asset allocation or age-based investing, provide specific percentage breakdowns
6. For beginner questions, provide clear step-by-step guidance

Current financial context: As of ${new Date().toLocaleDateString()}, inflation around 3.4%, Fed rates at 5.25-5.5%.

Respond to the user's question with specific, helpful financial guidance.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: financialPrompt }] }],
    });

    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ 
      error: "Failed to generate response", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
