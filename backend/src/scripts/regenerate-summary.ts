/**
 * 手动触发历史访谈的总结生成
 * 
 * 使用方法：
 * npx tsx src/scripts/regenerate-summary.ts <call_id>
 * 
 * 示例：
 * npx tsx src/scripts/regenerate-summary.ts abc123def456
 */

import { InterviewSummaryService } from '../services/interview-summary.service';
import { ResponseService } from '../services/responses.service';

const regenerateSummary = async (callId: string) => {
  console.log('🔄 开始为访谈生成总结...');
  console.log('📞 Call ID:', callId);
  
  try {
    // 获取response数据
    console.log('📊 获取访谈数据...');
    const response = await ResponseService.getResponseByCallId(callId);
    
    if (!response) {
      console.error('❌ 未找到访谈记录');
      process.exit(1);
    }
    
    console.log('✅ 访谈数据获取成功');
    console.log('   - 访谈者:', response.name || response.email);
    console.log('   - Interview ID:', response.interview_id);
    console.log('   - 是否已分析:', response.is_analysed);
    
    // 检查是否有transcript
    const transcript = response.details?.transcript;
    if (!transcript) {
      console.error('❌ 访谈没有transcript，无法生成总结');
      process.exit(1);
    }
    
    console.log('✅ Transcript存在，长度:', transcript.length, '字符');
    
    // 生成总结
    console.log('\n🤖 开始生成AI总结...');
    const result = await InterviewSummaryService.regenerateInterviewSummary(callId);
    
    if (result.status === 200 && result.summary) {
      console.log('\n✅ 总结生成成功！');
      console.log('\n📊 Key Insights:');
      result.summary.key_insights.forEach((insight, index) => {
        console.log(`   ${index + 1}. [${insight.category}] ${insight.content}`);
      });
      
      console.log('\n💬 Important Quotes:');
      result.summary.important_quotes.forEach((quote, index) => {
        console.log(`   ${index + 1}. "${quote.quote}" - ${quote.speaker} @ ${Math.floor(quote.timestamp / 60)}:${String(quote.timestamp % 60).padStart(2, '0')}`);
      });
      
      console.log('\n✅ 数据已保存到数据库');
    } else {
      console.error('\n❌ 总结生成失败:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 发生错误:', error);
    process.exit(1);
  }
};

// 从命令行参数获取call_id
const callId = process.argv[2];

if (!callId) {
  console.error('❌ 请提供call_id作为参数');
  console.log('\n使用方法:');
  console.log('  npx tsx src/scripts/regenerate-summary.ts <call_id>');
  console.log('\n示例:');
  console.log('  npx tsx src/scripts/regenerate-summary.ts abc123def456');
  process.exit(1);
}

regenerateSummary(callId);

