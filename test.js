import {Portkey} from 'portkey-ai';

const portkey = new Portkey({
  apiKey: "ATbhGU2QEhE2Bp5UCeIEPsNq9Avy"
});

async function classifyPrompt(userPrompt) {
  try {
    const response = await portkey.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a classifier. Respond only with valid JSON containing 'complexity' (basic/complex) and 'domain' (Coding_and_debugging, General_qa, Social_media_content, Summarization, Advices, Reasoning)." 
        },
        { 
          role: "user", 
          content: `Classify: "${userPrompt}"\n\nJSON format:\n{\n  "complexity": "basic",\n  "domain": "advices"\n}` 
        }
      ],
      model: "@openai/gpt-5-nano",
      response_format: { type: "json_object" },
      max_completion_tokens: 512
    });

    const content = response.choices[0].message.content;
    
    // Clean potential markdown
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    
    const result = JSON.parse(cleanContent);
    
    // Validate
    if (!result.complexity || !result.domain) {
      throw new Error("Missing required fields");
    }
    
    const validDomains = [
      'Coding_and_debugging',
      'General_qa', 
      'Social_media_content',
      'Summarization',
      'Advices',
      'Reasoning'
    ];
    
    if (!validDomains.includes(result.domain)) {
      result.domain = 'general_qa'; // Default fallback
    }
    
    if (!['basic', 'complex'].includes(result.complexity)) {
      result.complexity = 'basic'; // Default fallback
    }
    
    return {
      complexity: result.complexity,
      domain: result.domain,
      tokens: response.usage.total_tokens,
      latency: response.responseTime
    };
    
  } catch (error) {
    console.error("Classification error:", error);

    return {
      complexity: 'basic',
      domain: 'general_qa',
      error: error.message
    };
  }
}

async function main() {
  const prompts = [
    "Should I go to school or not?",
    "Write a Python function to reverse a string",
    "Summarize this article in 3 sentences",
    "Create an Instagram caption for a coffee shop"
  ];
  
  for (const prompt of prompts) {
    console.log(`\nPrompt: "${prompt}"`);
    const result = await classifyPrompt(prompt);
    console.log("→ Complexity:", result.complexity);
    console.log("→ Domain:", result.domain);
    console.log("→ Tokens:", result.tokens);
  }
}

main();
