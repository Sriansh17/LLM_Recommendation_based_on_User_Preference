import {Portkey} from 'portkey-ai';

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY || 'ATbhGU2QEhE2Bp5UCeIEPsNq9Avy'
});

const ALLOWED_DOMAINS = new Set([
  'Coding and Debugging',
  'Reasoning',
  'Advice',
  'Summarization',
  'Content Generation',
  'General Q&A'
]);

export async function classifyDomainLLM(userInput) {
  try {
    if (!userInput || userInput.trim().length === 0) {
      throw new Error('Input cannot be empty');
    }

    console.log(`🔍 Classifying domain for: "${userInput.substring(0, 50)}..."`);

    const response = await portkey.chat.completions.create({
      model: '@openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a classifier. Output ONLY one domain name from the allowed list. Do not include any explanation, just the domain name.'
        },
        {
          role: 'user',
          content: `
Allowed domains:
- Coding and Debugging
- Reasoning
- Advice
- Summarization
- Content Generation
- General Q&A

Classify this query:
"${userInput}"
`
        }
      ]
    });

    const domain = response.choices[0].message.content.trim();
    console.log(`✅ Classified as: ${domain}`);

    return ALLOWED_DOMAINS.has(domain)
      ? domain
      : 'General Q&A';

  } catch (err) {
    console.error(`⚠️ Domain classification failed: ${err.message}`);
    console.log('Using default domain: General Q&A');
    return 'General Q&A';
  }
}

