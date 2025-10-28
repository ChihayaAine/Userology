import { supabase } from '@/config/database';

const getAllInterviews = async (userId: string, organizationId: string) => {
  try {
    console.warn('【查询面试开始】：>>>>>>>>>>>> interviews.service.ts:7', {
      userId,
      organizationId,
      userIdExists: !!userId,
      orgIdExists: !!organizationId
    });

    // 构建查询条件：如果用户未登录，查找 NULL 值的记录
    let query = supabase.from("interview").select(`*`);
    
    if (userId && organizationId) {
      // 用户已登录，查找用户或组织的面试
      query = query.or(`organization_id.eq.${organizationId},user_id.eq.${userId}`);
    } else {
      // 用户未登录，查找公共面试（NULL 值）
      query = query.or(`organization_id.is.null,user_id.is.null`);
    }
    
    const { data: clientData, error: clientError } = await query
      .order("created_at", { ascending: false });

    console.warn('【查询面试结果】：>>>>>>>>>>>> interviews.service.ts:26', {
      count: clientData?.length || 0,
      error: clientError
    });

    return [...(clientData || [])];
  } catch (error) {
    console.error('【查询面试失败】：>>>>>>>>>>>> interviews.service.ts:33', error);
    
    return [];
  }
};

const getInterviewById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`*`)
      .or(`id.eq.${id},readable_slug.eq.${id}`);

    return data ? data[0] : null;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const updateInterview = async (payload: any, id: string) => {
  console.log('📝 Updating interview:', { id, payloadKeys: Object.keys(payload) });
  
  const { error, data } = await supabase
    .from("interview")
    .update({ ...payload })
    .eq("id", id)
    .select() // 添加 select() 来返回更新后的数据
    .single(); // 只返回一条记录
    
  if (error) {
    console.error('❌ Error updating interview:', error);
    throw new Error(`Failed to update interview: ${error.message}`);
  }

  console.log('✅ Interview updated successfully:', { id, updated: !!data });
  return data;
};

const deleteInterview = async (id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .delete()
    .eq("id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const getAllRespondents = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`respondents`)
      .eq("interview_id", interviewId);

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterview = async (payload: any) => {
  console.warn('【Supabase 插入开始】：>>>>>>>>>>>> interviews.service.ts:80', payload);
  
  const { error, data } = await supabase
    .from("interview")
    .insert({ ...payload });
    
  if (error) {
    console.error('【Supabase 插入错误】：>>>>>>>>>>>> interviews.service.ts:86', error);
    throw new Error(`Failed to create interview: ${error.message}`);
  }

  console.warn('【Supabase 插入成功】：>>>>>>>>>>>> interviews.service.ts:90', data);
  
  return data;
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  try {
    const { error } = await supabase
      .from("interview")
      .update({ is_active: false })
      .eq("organization_id", organizationId)
      .eq("is_active", true); // Optional: only update if currently active

    if (error) {
      console.error("Failed to deactivate interviews:", error);
    }
  } catch (error) {
    console.error("Unexpected error disabling interviews:", error);
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
};
