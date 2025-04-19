import { GoogleGenAI } from "@google/genai";

// Expanded list of financial/investing terms for better topic detection
const FINANCE_KEYWORDS = [
  'invest', 'stock', 'bond', 'portfolio', 'retirement', '401k', 'ira',
  'roth', 'mutual fund', 'etf', 'index fund', 'dividend', 'yield',
  'asset allocation', 'diversification', 'risk tolerance', 'bear market',
  'bull market', 'capital gains', 'compound interest', 'dollar cost averaging',
  'emergency fund', 'inflation', 'liquidity', 'market cap', 'recession',
  'roi', 'volatility', 'tax loss harvesting', 'annuity', 'balance sheet',
  'blue chip', 'brokerage', 'debt', 'equity', 'fidelity', 'hedge fund',
  'interest rate', 'mgit commit -m "Add chatbot files with new README"argin', 'net worth', 'option', 'p/e ratio', 'quantitative easing',
  'reit', 'sec', 'treasury', 'valuation', 'wealth', 'yield curve', 'crypto',
  'bitcoin', 'blockchain', 'nft', 'token', 'ico', 'defi', 'stablecoin',
  'budget', 'saving', 'loan', 'mortgage', 'credit', 'interest', 'tax',
  'insurance', 'estate', 'college fund', 'financial planning', 'wealth management',
  'market share', 'market cap', 'cryptocurrency', 'exchange', 'trading'
];

// REMOVED hardcoded API key - we don't need it in this file anymore
// This file only calls our secure API route which handles the key server-side

export async function generateResponse(prompt: string): Promise<string> {
  try {
    // Handle basic greetings directly without going to the API
    if (/^(hi|hello|hey|greetings|howdy)$/i.test(prompt.trim())) {
      return "Hello! I'm your FinAnswer assistant. I can help with investing, financial planning, and wealth management questions. What can I help you with today?";
    }

    // Call our API route instead of Gemini directly
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(`API returned ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating response:', error);
    return "I'm having trouble connecting to my knowledge base right now. Could you try asking your finance question again in a moment?";
  }
}