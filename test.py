import pygame
import random
import sys
import math
from enum import Enum

# 初始化pygame
pygame.init()

# 游戏常量
WINDOW_WIDTH = 600
WINDOW_HEIGHT = 700
BOARD_SIZE = 8
CELL_SIZE = 60
BOARD_X = (WINDOW_WIDTH - BOARD_SIZE * CELL_SIZE) // 2
BOARD_Y = 120
CANDY_TYPES = 6

# 颜色定义
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)
LIGHT_GRAY = (200, 200, 200)
BLUE = (100, 149, 237)
GREEN = (50, 205, 50)
RED = (220, 20, 60)
YELLOW = (255, 215, 0)
PURPLE = (147, 112, 219)
ORANGE = (255, 165, 0)
PINK = (255, 192, 203)

# 糖果颜色
CANDY_COLORS = [
    (255, 99, 71),   # 番茄红
    (50, 205, 50),   # 酸橙绿
    (30, 144, 255),  # 道奇蓝
    (255, 215, 0),   # 金色
    (147, 112, 219), # 中紫色
    (255, 165, 0)    # 橙色
]

class GameState(Enum):
    PLAYING = 1
    GAME_OVER = 2
    WIN = 3

class Particle:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.vx = random.uniform(-5, 5)
        self.vy = random.uniform(-8, -3)
        self.color = color
        self.life = 60
        self.max_life = 60
        
    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.vy += 0.2  # 重力
        self.life -= 1
        
    def draw(self, screen):
        if self.life > 0:
            alpha = int(255 * (self.life / self.max_life))
            size = int(4 * (self.life / self.max_life))
            if size > 0:
                pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), size)

class CandyCrushGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("🍭 消消乐游戏 🍭")
        self.clock = pygame.time.Clock()
        
        # 游戏状态
        self.board = [[0 for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        self.selected = None
        self.score = 0
        self.moves = 30
        self.target = 1000
        self.game_state = GameState.PLAYING
        self.combo = 0
        self.particles = []
        self.animation_time = 0
        self.falling_candies = []
        
        # 字体
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 36)
        self.font_small = pygame.font.Font(None, 24)
        
        # 初始化游戏板
        self.init_board()
        
    def init_board(self):
        """初始化游戏板，确保没有初始匹配"""
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                while True:
                    candy_type = random.randint(0, CANDY_TYPES - 1)
                    self.board[row][col] = candy_type
                    if not self.has_initial_match(row, col):
                        break
                        
    def has_initial_match(self, row, col):
        """检查是否有初始匹配"""
        candy_type = self.board[row][col]
        
        # 检查水平匹配
        if col >= 2 and self.board[row][col-1] == candy_type and self.board[row][col-2] == candy_type:
            return True
            
        # 检查垂直匹配
        if row >= 2 and self.board[row-1][col] == candy_type and self.board[row-2][col] == candy_type:
            return True
            
        return False
        
    def get_cell_pos(self, row, col):
        """获取单元格的屏幕坐标"""
        x = BOARD_X + col * CELL_SIZE
        y = BOARD_Y + row * CELL_SIZE
        return x, y
        
    def get_board_pos(self, mouse_x, mouse_y):
        """将鼠标坐标转换为游戏板坐标"""
        if mouse_x < BOARD_X or mouse_x >= BOARD_X + BOARD_SIZE * CELL_SIZE:
            return None, None
        if mouse_y < BOARD_Y or mouse_y >= BOARD_Y + BOARD_SIZE * CELL_SIZE:
            return None, None
            
        col = (mouse_x - BOARD_X) // CELL_SIZE
        row = (mouse_y - BOARD_Y) // CELL_SIZE
        
        if 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE:
            return row, col
        return None, None
        
    def is_adjacent(self, pos1, pos2):
        """检查两个位置是否相邻"""
        row1, col1 = pos1
        row2, col2 = pos2
        return abs(row1 - row2) + abs(col1 - col2) == 1
        
    def swap_candies(self, pos1, pos2):
        """交换两个糖果"""
        row1, col1 = pos1
        row2, col2 = pos2
        self.board[row1][col1], self.board[row2][col2] = self.board[row2][col2], self.board[row1][col1]
        
    def find_matches(self):
        """查找所有匹配的糖果"""
        matches = set()
        
        # 查找水平匹配
        for row in range(BOARD_SIZE):
            count = 1
            current_type = self.board[row][0]
            for col in range(1, BOARD_SIZE):
                if self.board[row][col] == current_type:
                    count += 1
                else:
                    if count >= 3:
                        for i in range(col - count, col):
                            matches.add((row, i))
                    count = 1
                    current_type = self.board[row][col]
            if count >= 3:
                for i in range(BOARD_SIZE - count, BOARD_SIZE):
                    matches.add((row, i))
                    
        # 查找垂直匹配
        for col in range(BOARD_SIZE):
            count = 1
            current_type = self.board[0][col]
            for row in range(1, BOARD_SIZE):
                if self.board[row][col] == current_type:
                    count += 1
                else:
                    if count >= 3:
                        for i in range(row - count, row):
                            matches.add((i, col))
                    count = 1
                    current_type = self.board[row][col]
            if count >= 3:
                for i in range(BOARD_SIZE - count, BOARD_SIZE):
                    matches.add((i, col))
                    
        return list(matches)
        
    def remove_matches(self, matches):
        """移除匹配的糖果并创建粒子效果"""
        for row, col in matches:
            # 创建粒子效果
            x, y = self.get_cell_pos(row, col)
            x += CELL_SIZE // 2
            y += CELL_SIZE // 2
            color = CANDY_COLORS[self.board[row][col]]
            
            for _ in range(8):
                self.particles.append(Particle(x, y, color))
                
            self.board[row][col] = -1  # 标记为空
            
    def drop_candies(self):
        """让糖果下落"""
        for col in range(BOARD_SIZE):
            # 收集非空糖果
            candies = []
            for row in range(BOARD_SIZE):
                if self.board[row][col] != -1:
                    candies.append(self.board[row][col])
                    
            # 清空列
            for row in range(BOARD_SIZE):
                self.board[row][col] = -1
                
            # 从底部填充
            for i, candy in enumerate(reversed(candies)):
                self.board[BOARD_SIZE - 1 - i][col] = candy
                
    def fill_board(self):
        """填充空位置"""
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                if self.board[row][col] == -1:
                    self.board[row][col] = random.randint(0, CANDY_TYPES - 1)
                    
    def process_matches(self):
        """处理匹配并返回是否有匹配"""
        matches = self.find_matches()
        if matches:
            self.combo += 1
            base_score = len(matches) * 10
            combo_bonus = (self.combo - 1) * 50 if self.combo > 1 else 0
            self.score += base_score + combo_bonus
            
            self.remove_matches(matches)
            self.drop_candies()
            self.fill_board()
            return True
        else:
            self.combo = 0
            return False
            
    def handle_click(self, pos):
        """处理鼠标点击"""
        if self.game_state != GameState.PLAYING or self.moves <= 0:
            return
            
        row, col = self.get_board_pos(*pos)
        if row is None or col is None:
            return
            
        if self.selected is None:
            self.selected = (row, col)
        else:
            if self.selected == (row, col):
                self.selected = None
            elif self.is_adjacent(self.selected, (row, col)):
                # 尝试交换
                self.swap_candies(self.selected, (row, col))
                
                # 检查是否有匹配
                if self.find_matches():
                    self.moves -= 1
                    # 处理所有连锁匹配
                    while self.process_matches():
                        pass
                else:
                    # 如果没有匹配，撤销交换
                    self.swap_candies(self.selected, (row, col))
                    
                self.selected = None
                self.check_game_end()
            else:
                self.selected = (row, col)
                
    def check_game_end(self):
        """检查游戏是否结束"""
        if self.score >= self.target:
            self.game_state = GameState.WIN
        elif self.moves <= 0:
            self.game_state = GameState.GAME_OVER
            
    def new_game(self):
        """开始新游戏"""
        self.score = 0
        self.moves = 30
        self.combo = 0
        self.selected = None
        self.game_state = GameState.PLAYING
        self.particles.clear()
        self.init_board()
        
    def draw_candy(self, screen, row, col):
        """绘制糖果"""
        x, y = self.get_cell_pos(row, col)
        candy_type = self.board[row][col]
        
        if candy_type == -1:
            return
            
        # 绘制糖果背景
        color = CANDY_COLORS[candy_type]
        
        # 如果被选中，添加发光效果
        if self.selected == (row, col):
            pygame.draw.circle(screen, YELLOW, (x + CELL_SIZE//2, y + CELL_SIZE//2), CELL_SIZE//2 + 5, 3)
            
        # 绘制糖果主体
        pygame.draw.circle(screen, color, (x + CELL_SIZE//2, y + CELL_SIZE//2), CELL_SIZE//2 - 5)
        
        # 添加高光效果
        highlight_color = tuple(min(255, c + 50) for c in color)
        pygame.draw.circle(screen, highlight_color, (x + CELL_SIZE//2 - 8, y + CELL_SIZE//2 - 8), 8)
        
    def draw_board(self, screen):
        """绘制游戏板"""
        # 绘制背景
        board_rect = pygame.Rect(BOARD_X - 10, BOARD_Y - 10, 
                                BOARD_SIZE * CELL_SIZE + 20, 
                                BOARD_SIZE * CELL_SIZE + 20)
        pygame.draw.rect(screen, (45, 55, 72), board_rect, border_radius=15)
        
        # 绘制网格
        for row in range(BOARD_SIZE + 1):
            y = BOARD_Y + row * CELL_SIZE
            pygame.draw.line(screen, GRAY, (BOARD_X, y), (BOARD_X + BOARD_SIZE * CELL_SIZE, y), 1)
            
        for col in range(BOARD_SIZE + 1):
            x = BOARD_X + col * CELL_SIZE
            pygame.draw.line(screen, GRAY, (x, BOARD_Y), (x, BOARD_Y + BOARD_SIZE * CELL_SIZE), 1)
            
        # 绘制糖果
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                self.draw_candy(screen, row, col)
                
    def draw_ui(self, screen):
        """绘制用户界面"""
        # 标题
        title = self.font_large.render("🍭 消消乐游戏 🍭", True, WHITE)
        title_rect = title.get_rect(center=(WINDOW_WIDTH//2, 30))
        screen.blit(title, title_rect)
        
        # 分数面板
        score_bg = pygame.Rect(50, 70, 150, 40)
        pygame.draw.rect(screen, (255, 20, 147), score_bg, border_radius=10)
        score_text = self.font_medium.render(f"分数: {self.score}", True, WHITE)
        screen.blit(score_text, (60, 80))
        
        # 目标面板
        target_bg = pygame.Rect(220, 70, 150, 40)
        pygame.draw.rect(screen, (50, 205, 50), target_bg, border_radius=10)
        target_text = self.font_medium.render(f"目标: {self.target}", True, WHITE)
        screen.blit(target_text, (230, 80))
        
        # 步数面板
        moves_bg = pygame.Rect(390, 70, 150, 40)
        pygame.draw.rect(screen, (30, 144, 255), moves_bg, border_radius=10)
        moves_text = self.font_medium.render(f"步数: {self.moves}", True, WHITE)
        screen.blit(moves_text, (400, 80))
        
        # 进度条
        progress_bg = pygame.Rect(50, 600, 500, 20)
        pygame.draw.rect(screen, GRAY, progress_bg, border_radius=10)
        
        progress = min(self.score / self.target, 1.0)
        progress_fill = pygame.Rect(50, 600, int(500 * progress), 20)
        pygame.draw.rect(screen, GREEN, progress_fill, border_radius=10)
        
        # 连击显示
        if self.combo > 1:
            combo_text = self.font_large.render(f"连击 x{self.combo}!", True, YELLOW)
            combo_rect = combo_text.get_rect(center=(WINDOW_WIDTH//2, 550))
            screen.blit(combo_text, combo_rect)
            
    def draw_game_over(self, screen):
        """绘制游戏结束界面"""
        # 半透明背景
        overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        screen.blit(overlay, (0, 0))
        
        # 结果面板
        panel_rect = pygame.Rect(100, 200, 400, 300)
        pygame.draw.rect(screen, WHITE, panel_rect, border_radius=20)
        pygame.draw.rect(screen, BLACK, panel_rect, 3, border_radius=20)
        
        if self.game_state == GameState.WIN:
            title = self.font_large.render("🎉 恭喜过关！", True, GREEN)
            message = self.font_medium.render("你成功达到了目标分数！", True, BLACK)
        else:
            title = self.font_large.render("😢 游戏结束", True, RED)
            message = self.font_medium.render("步数用完了，再试一次吧！", True, BLACK)
            
        title_rect = title.get_rect(center=(WINDOW_WIDTH//2, 250))
        message_rect = message.get_rect(center=(WINDOW_WIDTH//2, 300))
        
        screen.blit(title, title_rect)
        screen.blit(message, message_rect)
        
        # 最终分数
        final_score = self.font_medium.render(f"最终分数: {self.score}", True, BLUE)
        final_score_rect = final_score.get_rect(center=(WINDOW_WIDTH//2, 350))
        screen.blit(final_score, final_score_rect)
        
        # 重新开始按钮
        button_rect = pygame.Rect(200, 400, 200, 50)
        pygame.draw.rect(screen, GREEN, button_rect, border_radius=10)
        button_text = self.font_medium.render("再玩一次", True, WHITE)
        button_text_rect = button_text.get_rect(center=button_rect.center)
        screen.blit(button_text, button_text_rect)
        
        return button_rect
        
    def update_particles(self):
        """更新粒子效果"""
        self.particles = [p for p in self.particles if p.life > 0]
        for particle in self.particles:
            particle.update()
            
    def draw_particles(self, screen):
        """绘制粒子效果"""
        for particle in self.particles:
            particle.draw(screen)
            
    def run(self):
        """主游戏循环"""
        running = True
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if self.game_state == GameState.PLAYING:
                        self.handle_click(event.pos)
                    else:
                        # 检查是否点击了重新开始按钮
                        button_rect = pygame.Rect(200, 400, 200, 50)
                        if button_rect.collidepoint(event.pos):
                            self.new_game()
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_r:  # 按R键重新开始
                        self.new_game()
                    elif event.key == pygame.K_ESCAPE:  # 按ESC键退出
                        running = False
                        
            # 更新游戏状态
            self.update_particles()
            
            # 绘制游戏
            # 渐变背景
            for y in range(WINDOW_HEIGHT):
                color_ratio = y / WINDOW_HEIGHT
                r = int(102 * (1 - color_ratio) + 118 * color_ratio)
                g = int(126 * (1 - color_ratio) + 75 * color_ratio)
                b = int(234 * (1 - color_ratio) + 162 * color_ratio)
                pygame.draw.line(self.screen, (r, g, b), (0, y), (WINDOW_WIDTH, y))
            
            self.draw_ui(self.screen)
            self.draw_board(self.screen)
            self.draw_particles(self.screen)
            
            if self.game_state != GameState.PLAYING:
                restart_button = self.draw_game_over(self.screen)
                
            pygame.display.flip()
            self.clock.tick(60)
            
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = CandyCrushGame()
    game.run()