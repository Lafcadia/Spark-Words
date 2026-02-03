/**
 * 平滑打字机动画控制器 v4
 * 
 * 完全重写的实现：
 * - 使用绝对位置追踪替代增量计算
 * - 内建防重复机制
 * - 更流畅的视觉效果
 */

// 动画参数配置 - 丝滑优化版
const CONFIG = {
  // 速度控制
  BASE_SPEED: 180,            // 基础速度（字符/秒）- 更快启动
  MIN_SPEED: 120,             // 最小速度 - 保持流畅
  MAX_SPEED: 600,             // 最大速度 - 允许更快清空

  // 自适应加速
  QUEUE_ACCELERATION: 5,      // 每个待处理字符增加的速度
  BURST_THRESHOLD: 30,        // 触发爆发模式的队列长度
  BURST_MULTIPLIER: 2.2,      // 爆发模式速度倍数

  // 平滑过渡 - 关键参数
  SPEED_LERP: 0.35,           // 速度插值系数（更快响应）

  // 启动优化
  WARMUP_DURATION: 150,       // 预热时间（更短，更快进入状态）
  WARMUP_START_RATIO: 0.8,    // 预热开始时的速度比例（更高起点）
};

export interface SmoothTextController {
  readonly isAnimationActive: boolean;
  isTokenRemain: () => boolean;
  pushText: (fullText: string) => void;  // 新 API：推送完整目标文本
  pushToQueue: (text: string) => void;   // 兼容旧 API
  startAnimation: () => Promise<void>;
  stopAnimation: () => void;
  getCurrentSpeed: () => number;
  getProgress: () => { displayed: number; target: number };
  reset: () => void;  // 新增：重置状态
}

export const createSmoothText = (params: {
  onTextUpdate: (delta: string, fullText: string) => void;
  startSpeed?: number;
}): SmoothTextController => {
  const baseSpeed = params.startSpeed ?? CONFIG.BASE_SPEED;

  // ===== 核心状态 =====
  let targetText = '';           // 目标文本（完整）
  let displayedLength = 0;       // 已显示的字符数
  let isAnimationActive = false;
  let animationFrameId: number | null = null;

  // ===== 动画状态 =====
  let lastFrameTime = 0;
  let accumulatedTime = 0;
  let currentSpeed = baseSpeed;
  let targetSpeed = baseSpeed;
  let animationStartTime = 0;

  // ===== 辅助函数 =====

  const getDisplayedText = () => targetText.slice(0, displayedLength);

  const getPendingLength = () => targetText.length - displayedLength;

  const cleanup = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isAnimationActive = false;
  };

  // 计算目标速度
  const calculateTargetSpeed = (pendingChars: number, elapsed: number): number => {
    let speed = baseSpeed;

    // 预热阶段：从较低速度启动
    if (elapsed < CONFIG.WARMUP_DURATION) {
      const progress = elapsed / CONFIG.WARMUP_DURATION;
      // ease-out 曲线
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const warmupMultiplier = CONFIG.WARMUP_START_RATIO + (1 - CONFIG.WARMUP_START_RATIO) * easeOut;
      speed *= warmupMultiplier;
    }

    // 队列加速：待处理字符越多，速度越快
    if (pendingChars > 0) {
      speed += pendingChars * CONFIG.QUEUE_ACCELERATION;
    }

    // 爆发模式：大量堆积时加速处理
    if (pendingChars > CONFIG.BURST_THRESHOLD) {
      speed *= CONFIG.BURST_MULTIPLIER;
    }

    // 限制速度范围
    return Math.max(CONFIG.MIN_SPEED, Math.min(speed, CONFIG.MAX_SPEED));
  };

  // 动画主循环
  const animationLoop = (timestamp: number, resolve: () => void) => {
    if (!isAnimationActive) {
      cleanup();
      resolve();
      return;
    }

    const pendingChars = getPendingLength();

    // 无待处理字符，结束动画
    if (pendingChars <= 0) {
      cleanup();
      resolve();
      return;
    }

    // 计算帧间隔
    const frameDelta = lastFrameTime ? timestamp - lastFrameTime : 16;
    lastFrameTime = timestamp;
    accumulatedTime += frameDelta;

    // 计算已运行时间（用于预热）
    const elapsed = timestamp - animationStartTime;

    // 更新速度（平滑过渡）
    targetSpeed = calculateTargetSpeed(pendingChars, elapsed);
    currentSpeed += (targetSpeed - currentSpeed) * CONFIG.SPEED_LERP;

    // 计算本帧应输出的字符数
    const charsPerMs = currentSpeed / 1000;
    const charsToOutput = Math.floor(accumulatedTime * charsPerMs);

    if (charsToOutput > 0) {
      // 扣除已使用的时间
      accumulatedTime -= charsToOutput / charsPerMs;

      // 计算实际可输出的字符数
      const actualChars = Math.min(charsToOutput, pendingChars);
      const oldLength = displayedLength;
      displayedLength += actualChars;

      // 获取增量和完整文本
      const delta = targetText.slice(oldLength, displayedLength);
      const fullText = getDisplayedText();

      // 触发回调
      params.onTextUpdate(delta, fullText);
    }

    // 继续下一帧
    animationFrameId = requestAnimationFrame((ts) => animationLoop(ts, resolve));
  };

  // ===== 公共 API =====

  const pushText = (fullText: string) => {
    // 只接受更长的文本（防止重复/倒退）
    if (fullText.length > targetText.length) {
      targetText = fullText;
    }
  };

  // 兼容旧 API：追加文本
  const pushToQueue = (text: string) => {
    targetText += text;
  };

  const startAnimation = (): Promise<void> => {
    return new Promise((resolve) => {
      if (isAnimationActive) {
        // 已在运行，直接返回
        resolve();
        return;
      }

      if (getPendingLength() <= 0) {
        // 无待处理内容
        resolve();
        return;
      }

      // 初始化动画状态
      isAnimationActive = true;
      lastFrameTime = 0;
      accumulatedTime = 0;
      animationStartTime = performance.now();
      currentSpeed = baseSpeed * CONFIG.WARMUP_START_RATIO;

      // 启动动画循环
      animationFrameId = requestAnimationFrame((ts) => animationLoop(ts, resolve));
    });
  };

  const stopAnimation = () => {
    cleanup();
  };

  const reset = () => {
    cleanup();
    targetText = '';
    displayedLength = 0;
    currentSpeed = baseSpeed;
    targetSpeed = baseSpeed;
    accumulatedTime = 0;
  };

  // ===== 返回控制器 =====
  return {
    get isAnimationActive() {
      return isAnimationActive;
    },
    isTokenRemain: () => getPendingLength() > 0,
    pushText,
    pushToQueue,
    startAnimation,
    stopAnimation,
    getCurrentSpeed: () => currentSpeed,
    getProgress: () => ({ displayed: displayedLength, target: targetText.length }),
    reset,
  };
};
