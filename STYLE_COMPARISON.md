# Apple Design 样式对比速览

## 🎨 色彩系统

### 修改前
```
背景：渐变色（#667eea → #764ba2 → #f093fb）
卡片：深色渐变
文字：白色带阴影
边框：黑色像素边框
```

### 修改后
```
背景：浅色径向渐变（#E8F0FE → #F5F5F7）
卡片：纯白 #FFFFFF
文字：深灰 #1D1D1F
边框：无，使用阴影和圆角
```

## 📝 字体系统

### 修改前
```css
font-family: 'Courier New', Courier, monospace;
```

### 修改后
```css
font-family: -apple-system, BlinkMacSystemFont, 
             "SF Pro Text", "Inter", sans-serif;
```

## 🎯 关键组件对比

### 游戏标题

**修改前：**
```
⚔️ 技能五子棋 ⚔️
- 48px，白色
- 像素描边阴影
- 闪烁动画
```

**修改后：**
```
技能五子棋
- 34px，深灰色 #1D1D1F
- 无表情符号
- 无动画，稳重专业
```

### 棋盘

**修改前：**
```
背景：木纹色 #DEB887
圆角：8px
边框：无
```

**修改后：**
```
背景：纯白 #FFFFFF
圆角：16px
阴影：0 8px 24px rgba(0,0,0,0.06)
```

### 棋子

**修改前：**
```css
.piece.black {
  background: radial-gradient(circle at 30% 30%, #555, #000);
  border: 1px solid #000;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
```

**修改后：**
```css
.piece.black {
  background: #1D1D1F;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

### 技能卡片

**修改前：**
```
尺寸：80px × 100px（纵向）
背景：渐变 #667eea → #764ba2
边框：3px 黑色像素边框
悬停：上移 + 缩放
```

**修改后：**
```
尺寸：120px × 80px（横向）
背景：纯色 #007AFF
边框：无
悬停：缩放 1.05
```

### 弹窗

**修改前：**
```css
.modal-content {
  border: 4px solid #000;
  box-shadow: 0 0 0 2px #fff, 0 0 0 6px #000;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 4px solid #000;
}
```

**修改后：**
```css
.modal-content {
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: transparent;
  border-bottom: 1px solid #D2D2D7;
}
```

### 按钮

**修改前：**
```css
.btn {
  border: 3px solid #000;
  border-radius: 4px;
  box-shadow: 0 4px 0 #000;
  text-transform: uppercase;
}
```

**修改后：**
```css
.btn {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}
```

## 🎬 动画对比

### 修改前
```
缓动函数：linear, ease
持续时间：固定值
效果：硬切换、闪烁
```

### 修改后
```
缓动函数：cubic-bezier(0.25, 0.46, 0.45, 0.94)
持续时间：0.2s - 0.6s
效果：流畅、自然、弹性
```

## 📱 新增：欢迎界面

```jsx
<WelcomeScreen>
  ├─ 主标题："技能五子棋" (48px, 粗体)
  ├─ 游戏描述：18px，灰色
  └─ 开始按钮：蓝色，带阴影
</WelcomeScreen>
```

**进入动画序列：**
1. 卡片上移淡入（0.6s）
2. 标题淡入（0.2s 延迟）
3. 描述淡入（0.4s 延迟）
4. 按钮上移淡入（0.6s 延迟）

## 🎯 CSS 变量系统

```css
:root {
  /* 色彩 */
  --color-primary: #007AFF;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-danger: #FF3B30;
  
  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.06);
  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

## 📊 代码统计

| 指标 | 数量 |
|------|------|
| 修改文件 | 9 个 |
| 新增文件 | 2 个 |
| CSS 变量定义 | 30+ 个 |
| 动画定义 | 15+ 个 |
| 响应式断点 | 4 个 |
| 代码行数变化 | +900 / -600 |

## ✨ 核心改进

1. **视觉现代化**：从像素艺术 → 现代简洁
2. **色彩优雅化**：从鲜艳渐变 → 浅色柔和
3. **动画流畅化**：从硬切换 → 自然过渡
4. **布局合理化**：完整响应式支持
5. **体验提升**：新增欢迎界面和界面切换
