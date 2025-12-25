
import React from 'react';

export const COLORS = {
  primary: '#10B981', // Emerald 500
  secondary: '#3B82F6', // Blue 500
  accent: '#F59E0B',    // Amber 500
  bg: '#F8FAFC',
};

export const COPY = {
  theme: "Spring.log: 重构生活",
  intro: "改 Bug 改累了吗？内存溢出了吗？是时候强制关闭 IDE，断开物理连接，将身体推送到大自然的分支。加入我们，体验零延迟、高带宽的户外社交，完成一次真实的 P2P 交流。",
  tips: [
    { title: "硬核环境配置", content: "出发前请执行 `npm install sunscreen`。紫外线是最大的内存泄漏源，请务必做好物理隔离。" },
    { title: "原子化提交", content: "确保生产环境的分支已合并且稳定。山里没有信号，拒绝任何形式的户外 Hotfix！" },
    { title: "冗余电源备份", content: "充电宝是你的物理 RAID 1。不要让你的身体含水量跌至 0%，随时保持补给。" }
  ],
  feedback: "Submission 200 OK。你的报名信息已成功推送到活动主分支。我们野外见！",
  prompt: "Flat vector illustration style, a group of diverse young tech people in hoodies camping on vibrant green grass, some debugging on laptops under trees, some playing frisbee, majestic spring mountains in the background, bright and optimistic morning sunlight, 16:9 aspect ratio."
};

export const MOCK_REGISTRATIONS = [
  "姓名,部门,饮食禁忌,T恤尺码,拼车意向,紧急联系方式,报名时间",
  "张小龙,前端组,无,L,有车出车,13800138000,2026-03-20 10:00:00",
  "雷军,后端组,素食,M,需拼车,13912345678,2026-03-20 11:30:00",
  "马化腾,运维组,无,XL,自驾,13700001111,2026-03-20 14:15:00",
  "丁磊,测试组,清真,S,需拼车,13611112222,2026-03-21 09:45:00",
  "李彦宏,产品组,过敏,XXL,有车出车,13533334444,2026-03-21 16:20:00"
].join("\n");
