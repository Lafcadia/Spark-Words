/**
 * 响应动画样式类型定义
 * 基于 LobeHub 实现
 */

/**
 * 响应动画样式
 */
export type ResponseAnimationStyle = 'none' | 'smooth';

/**
 * 响应动画配置
 * 可以是简单的样式字符串，也可以是包含详细配置的对象
 */
export type ResponseAnimation = 
  | ResponseAnimationStyle 
  | {
      text?: ResponseAnimationStyle;
      speed?: number;  // 字符/秒
    };

/**
 * 标准化动画配置
 * 将简单样式或对象配置统一转换为对象格式
 * 
 * @param animationStyle - 动画配置（字符串或对象）
 * @returns 标准化的对象配置
 */
export const standardizeAnimationStyle = (
  animationStyle?: ResponseAnimation,
): Exclude<ResponseAnimation, ResponseAnimationStyle> => {
  return typeof animationStyle === 'object' 
    ? animationStyle 
    : { text: animationStyle };
};
