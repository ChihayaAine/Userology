/**
 * Backfill script: Generate summaries for historical interviews
 *
 * This script generates Key Insights and Important Quotes for existing interviews
 * that don't have summaries yet. It fetches transcripts from Retell API.
 *
 * Usage:
 *   cd backend && npx tsx src/scripts/find-and-backfill.ts [studyName]
 *
 * Examples:
 *   npx tsx src/scripts/find-and-backfill.ts "ai product"
 *   npx tsx src/scripts/find-and-backfill.ts  # Will prompt for study name
 */

import { supabase } from '../config/database';
import { InterviewSummaryService } from '../services/interview-summary.service';
import { ResponseService } from '../services/responses.service';
import { StudySummaryService } from '../services/study-summary.service';
import { retellClient } from '../config/retell';
import * as readline from 'readline';

async function promptForStudyName(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter study name to search for: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function findAndBackfill(studyName?: string) {
  // Get study name from argument or prompt
  const searchName = studyName || await promptForStudyName();

  if (!searchName) {
    console.error('❌ Study name is required');
    return;
  }

  console.log(`🔍 Searching for Study: "${searchName}"...\n`);

  try {
    // Find all interviews matching the study name
    const { data: interviews, error: interviewError } = await supabase
      .from('interview')
      .select('id, name, objective, created_at')
      .ilike('name', `%${searchName}%`)
      .order('created_at', { ascending: false });

    if (interviewError) {
      console.error('❌ Query failed:', interviewError);
      return;
    }

    if (!interviews || interviews.length === 0) {
      console.error(`❌ No studies found matching "${searchName}"`);
      return;
    }

    console.log(`✅ Found ${interviews.length} study(ies):\n`);

    // 为每个interview查询response数量
    for (let i = 0; i < interviews.length; i++) {
      const interview = interviews[i];
      const responses = await ResponseService.getAllResponses(interview.id);
      
      console.log(`${i + 1}. ID: ${interview.id}`);
      console.log(`   Name: ${interview.name}`);
      console.log(`   Objective: ${interview.objective}`);
      console.log(`   Responses: ${responses.length} 条`);
      console.log(`   Created: ${new Date(interview.created_at).toLocaleString()}\n`);
    }

    // 找到有最多responses的interview
    let targetInterview = null;
    let maxResponses = 0;

    for (const interview of interviews) {
      const responses = await ResponseService.getAllResponses(interview.id);
      if (responses.length > maxResponses) {
        maxResponses = responses.length;
        targetInterview = interview;
      }
    }

    if (!targetInterview || maxResponses === 0) {
      console.error('❌ 没有找到有访谈记录的Study');
      return;
    }

    console.log(`\n🎯 选择访谈记录最多的Study:`);
    console.log(`   ID: ${targetInterview.id}`);
    console.log(`   Name: ${targetInterview.name}`);
    console.log(`   Responses: ${maxResponses} 条\n`);

    // 开始生成
    await backfillInsights(targetInterview.id);

  } catch (error: any) {
    console.error('❌ 脚本执行失败:', error.message);
    console.error(error.stack);
  }
}

async function backfillInsights(interviewId: string) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 开始生成完整总结...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: 获取所有访谈记录
    console.log('📊 Step 1: 获取所有访谈记录...');
    const responses = await ResponseService.getAllResponses(interviewId);
    
    if (!responses || responses.length === 0) {
      console.error('❌ 没有找到访谈记录');
      return;
    }

    console.log(`✅ 找到 ${responses.length} 条访谈记录\n`);

    // Step 2: 为每个访谈生成Key Insights和Important Quotes
    console.log('🔍 Step 2: 为每个访谈生成Key Insights和Important Quotes...\n');
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const callId = response.call_id;
      const userName = response.name || response.email || 'Unknown';
      
      console.log(`[${i + 1}/${responses.length}] ${userName} (${callId})`);
      
      // 检查是否已经有insights
      if (response.key_insights && response.key_insights.length > 0) {
        console.log(`  ⏭️  已有 ${response.key_insights.length} 条insights，跳过\n`);
        skipCount++;
        continue;
      }

      try {
        console.log(`  🔄 从Retell API获取transcript...`);

        // 从Retell API获取通话数据
        let transcriptText = '';
        try {
          const callData = await retellClient.call.retrieve(callId);
          transcriptText = callData.transcript || '';

          if (!transcriptText) {
            console.log(`  ⚠️  Retell API返回的transcript为空，跳过\n`);
            skipCount++;
            continue;
          }

          console.log(`  ✓ 获取到transcript (${transcriptText.length} 字符)`);
        } catch (retellError: any) {
          console.log(`  ❌ 无法从Retell API获取数据: ${retellError.message}`);
          skipCount++;
          continue;
        }

        console.log(`  🔄 生成Key Insights和Important Quotes...`);

        const result = await InterviewSummaryService.generateInterviewSummary({
          callId,
          interviewId,
          transcript: transcriptText,
        });

        if (result.status === 200) {
          console.log(`  ✅ 生成成功`);
          const insights = result.summary?.insights_with_evidence || [];
          const totalQuotes = insights.reduce((sum, insight) => sum + (insight.supporting_quotes?.length || 0), 0);
          console.log(`     - Insights: ${insights.length} 条`);
          console.log(`     - Total Supporting Quotes: ${totalQuotes} 条\n`);
          successCount++;
        } else {
          console.log(`  ❌ 生成失败: ${result.error}\n`);
          errorCount++;
        }

        // 避免API限流，每次生成后等待2秒
        if (i < responses.length - 1) {
          console.log(`  ⏳ 等待2秒...\n`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.log(`  ❌ 生成出错: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Step 2 完成统计:');
    console.log(`  ✅ 成功: ${successCount} 条`);
    console.log(`  ⏭️  跳过: ${skipCount} 条`);
    console.log(`  ❌ 失败: ${errorCount} 条`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 3: 生成Study级别总结
    console.log('🎯 Step 3: 生成Study级别总结...\n');
    
    try {
      console.log('  🔄 生成中（这可能需要30-60秒）...');
      const studyResult = await StudySummaryService.generateStudySummary({
        interviewId,
      });

      if (studyResult.status === 200) {
        console.log('  ✅ Study总结生成成功！');
        console.log(`     - Executive Summary: ${studyResult.summary?.executive_summary ? '✓' : '✗'}`);
        console.log(`     - Objective Deliverables: ${studyResult.summary?.objective_deliverables ? '✓' : '✗'}`);
        console.log(`     - Cross-Interview Insights: ${studyResult.summary?.cross_interview_insights?.length || 0} 条`);
        console.log(`     - Evidence Bank: ${studyResult.summary?.evidence_bank?.length || 0} 条\n`);
      } else {
        console.log(`  ❌ Study总结生成失败: ${studyResult.error}\n`);
      }
    } catch (error: any) {
      console.log(`  ❌ Study总结生成出错: ${error.message}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 全部完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 下一步：');
    console.log('  1. 刷新浏览器页面');
    console.log('  2. 查看单访谈页面的Key Insights和Important Quotes');
    console.log('  3. 查看Study页面，点击"Study Insights" Tab');
    console.log('  4. 如果没有看到Study Insights，点击"Generate Insights"按钮\n');

  } catch (error: any) {
    console.error('❌ 脚本执行失败:', error.message);
    console.error(error.stack);
  }
}

// Execute with command line argument or prompt
const studyNameArg = process.argv[2];
findAndBackfill(studyNameArg)
  .then(() => {
    console.log('✅ Script completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

