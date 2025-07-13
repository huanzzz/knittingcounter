const axios = require('axios');

// 测试URL
const testUrl = 'https://www.xiaohongshu.com/explore/6715a304000000001402e6dd?xsec_token=ABo705ol96KFJT3y_X2W5X24c9WqEXMTcLHPbTdN2hqxo=&xsec_source=pc_user&source=web_user_page';

async function testAPI() {
  console.log('🧪 Testing XHS Image API...\n');
  
  try {
    // 测试健康检查
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', healthResponse.data);
    console.log('');
    
    // 测试基础端点
    console.log('2. Testing basic endpoint...');
    const testResponse = await axios.get('http://localhost:3001/api/test');
    console.log('✅ Basic test:', testResponse.data);
    console.log('');
    
    // 测试图片抓取
    console.log('3. Testing image extraction...');
    console.log(`📎 URL: ${testUrl}`);
    console.log('⏳ Fetching images...\n');
    
    const imageResponse = await axios.post('http://localhost:3001/api/xhs/images', {
      url: testUrl
    });
    
    const { success, images, count } = imageResponse.data;
    
    if (success) {
      console.log(`✅ Successfully extracted ${count} images:`);
      images.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img}`);
      });
    } else {
      console.log('❌ Failed to extract images');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.data);
    } else if (error.request) {
      console.log('❌ Network Error: Cannot connect to server');
      console.log('💡 Make sure the server is running: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// 运行测试
testAPI(); 