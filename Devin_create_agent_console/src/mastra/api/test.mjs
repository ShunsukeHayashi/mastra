import fetch from 'node-fetch';

// Test the SerpAPI search endpoint
async function testSerpApiSearch() {
  console.log('Testing SerpAPI search endpoint...');
  
  try {
    const response = await fetch('http://localhost:4111/api/serp-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'マストラ AI エージェント',
        num: 5,
        includeKnowledgeGraph: true,
        includeRelatedQuestions: true,
      }),
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Error testing SerpAPI search:', error);
    return { success: false, error: error.message };
  }
}

// Test the competitor analysis endpoint
async function testCompetitorAnalysis() {
  console.log('\nTesting competitor analysis endpoint...');
  
  try {
    const response = await fetch('http://localhost:4111/api/analyze-competitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: 'note.com 記事作成 コツ',
        siteFilter: 'site:note.com',
        numResults: 3,
      }),
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Error testing competitor analysis:', error);
    return { success: false, error: error.message };
  }
}

// Test the SEO content plan endpoint
async function testSeoContentPlan() {
  console.log('\nTesting SEO content plan endpoint...');
  
  try {
    const response = await fetch('http://localhost:4111/api/create-seo-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mainKeyword: 'note.com SEO 最適化',
        targetAudience: 'コンテンツクリエイター',
        contentType: 'ハウツー',
      }),
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Error testing SEO content plan:', error);
    return { success: false, error: error.message };
  }
}

// Test the Note.com search endpoint
async function testNoteSearch() {
  console.log('\nTesting Note.com search endpoint...');
  
  try {
    const response = await fetch('http://localhost:4111/api/search-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: 'AI エージェント',
        size: 5,
        start: 0,
      }),
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Error testing Note.com search:', error);
    return { success: false, error: error.message };
  }
}

// Test error handling with invalid input
async function testErrorHandling() {
  console.log('\nTesting error handling with invalid input...');
  
  try {
    const response = await fetch('http://localhost:4111/api/serp-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required 'query' parameter
        num: 5,
      }),
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.status === 400, status: response.status, data };
  } catch (error) {
    console.error('Error testing error handling:', error);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test SerpAPI search
  const searchResult = await testSerpApiSearch();
  
  // Test competitor analysis
  const analysisResult = await testCompetitorAnalysis();
  
  // Test SEO content plan
  const planResult = await testSeoContentPlan();
  
  // Test Note.com search
  const noteSearchResult = await testNoteSearch();
  
  // Test error handling
  const errorResult = await testErrorHandling();
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log('SerpAPI Search:', searchResult.success ? 'PASS' : 'FAIL');
  console.log('Competitor Analysis:', analysisResult.success ? 'PASS' : 'FAIL');
  console.log('SEO Content Plan:', planResult.success ? 'PASS' : 'FAIL');
  console.log('Note.com Search:', noteSearchResult.success ? 'PASS' : 'FAIL');
  console.log('Error Handling:', errorResult.success ? 'PASS' : 'FAIL');
  
  const allPassed = 
    searchResult.success && 
    analysisResult.success && 
    planResult.success && 
    noteSearchResult.success && 
    errorResult.success;
  
  console.log('\nOverall Result:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
}

// Run the tests
runTests();
