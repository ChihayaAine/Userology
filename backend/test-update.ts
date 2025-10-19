import { retellClient } from './src/config/retell';

async function testUpdate() {
  try {
    console.log('🧪 Testing agent.update...');
    
    const agentId = 'agent_2b6e92b94275dfafbe24289de8';
    
    // 先获取当前信息
    const agent = await retellClient.agent.retrieve(agentId);
    console.log('✅ Current agent info:', {
      agent_id: agent.agent_id,
      agent_name: agent.agent_name,
      language: agent.language,
      voice_id: agent.voice_id
    });
    
    // 尝试更新
    console.log('\n🔄 Attempting update to zh-CN...');
    const updated = await retellClient.agent.update(agentId, {
      language: 'zh-CN',
      voice_id: '11labs-Matilda'
    });
    
    console.log('✅ Update successful!', {
      agent_id: updated.agent_id,
      agent_name: updated.agent_name,
      language: updated.language,
      voice_id: updated.voice_id
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUpdate();

