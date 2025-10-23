require('dotenv').config()

console.log('🔍 Testing Environment Variables...\n')

console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing')
console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? '✅ Loaded' : '❌ Missing')
console.log('AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT ? '✅ Loaded' : '❌ Missing')
console.log('AZURE_OPENAI_RESOURCE:', process.env.AZURE_OPENAI_RESOURCE ? '✅ Loaded' : '❌ Missing')
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? '✅ Loaded' : '❌ Missing')

console.log('\n📋 Summary:')
const allLoaded = process.env.AZURE_OPENAI_API_KEY && 
                  process.env.AZURE_OPENAI_ENDPOINT && 
                  process.env.AZURE_OPENAI_DEPLOYMENT && 
                  process.env.AZURE_OPENAI_RESOURCE && 
                  process.env.FIRECRAWL_API_KEY

if (allLoaded) {
  console.log('✅ All environment variables loaded successfully!')
} else {
  console.log('❌ Some environment variables are missing. Check your .env file.')
}
