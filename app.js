import React, { useState, useEffect, useRef } from 'react';

// --- 日历组件 ---
const Calendar = () => {
    const [date, setDate] = useState(new Date());
    // 模拟已打卡日期
    const checkedInDays = [3, 8, 9, 15, 22]; 

    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} style={styles.calendarDayEmpty}></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const isCheckedIn = checkedInDays.includes(i);
        
        let dayStyle = styles.calendarDay;
        if(isToday) dayStyle = {...dayStyle, ...styles.calendarDayToday};
        if(isCheckedIn) dayStyle = {...dayStyle, ...styles.calendarDayCheckedIn};

        days.push(
            <div key={i} style={dayStyle}>
                {i}
                {isCheckedIn && <span style={styles.checkMark}>✔</span>}
            </div>
        );
    }

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
        <div style={styles.calendarContainer}>
            <div style={styles.calendarHeader}>
                <h3>{`${year}年 ${month + 1}月`}</h3>
            </div>
            <div style={styles.calendarGrid}>
                {weekDays.map(day => <div key={day} style={styles.calendarWeekDay}>{day}</div>)}
                {days}
            </div>
        </div>
    );
};


// --- 图标组件 (Web版本) ---
const Icon = ({ name, size = 24, color = '#555' }) => (
    <div style={{...styles.icon, width: size, height: size, backgroundColor: color, borderRadius: size / 2, margin: 4 }}>
        <span style={{ color: 'white', fontSize: size * 0.6 }}>{name.charAt(0)}</span>
    </div>
);

// --- 星星评分组件 ---
const StarRating = ({ rating = 0, totalStars = 5 }) => {
    return (
      <div style={styles.starContainer}>
        {[...Array(totalStars)].map((_, index) => {
          return (
            <span key={index} style={{...styles.star, color: index < rating ? '#FFD700' : '#E0E0E0' }}>
              ★
            </span>
          );
        })}
      </div>
    );
};


// --- 底部导航栏 (Web版本) ---
const BottomTabBar = ({ activeTab, setActiveTab, onPlusPress, currentScreen }) => {
    const mainTabs = ['首页', '课程', '训练', '我的'];
    
    // 当在首页时，渲染带加号的5栏布局
    if (currentScreen === 'Home') {
        const tabsWithPlus = ['首页', '课程', 'add', '训练', '我的'];
        return (
             <div style={styles.tabBarContainer}>
                {tabsWithPlus.map((tab) => {
                    if (tab === 'add') {
                        // 占位，为绝对定位的按钮留出空间
                        return <div key="plus-placeholder" style={styles.tabItem}></div>;
                    }
                    return (
                        <button key={tab} style={styles.tabItem} onClick={() => setActiveTab(tab)}>
                            <Icon name={tab} color={activeTab === tab ? '#4A90E2' : '#9B9B9B'} />
                            <span style={{...styles.tabLabel, color: activeTab === tab ? '#4A90E2' : '#9B9B9B' }}>{tab}</span>
                        </button>
                    );
                })}
                {/* 绝对定位的加号按钮 */}
                <button style={styles.plusButton} onClick={onPlusPress}>
                    <span style={styles.plusButtonText}>+</span>
                </button>
            </div>
        )
    }

    // 在其他页面，均匀分布四个tab
    return (
        <div style={styles.tabBarContainer}>
            {mainTabs.map((tab) => (
                <button key={tab} style={styles.tabItem} onClick={() => setActiveTab(tab)}>
                    <Icon name={tab} color={activeTab === tab ? '#4A90E2' : '#9B9B9B'} />
                    <span style={{...styles.tabLabel, color: activeTab === tab ? '#4A90E2' : '#9B9B9B' }}>{tab}</span>
                </button>
            ))}
        </div>
    );
};

// --- 舒尔特方格游戏组件 (Web版本) ---
const SchulteGame = ({ difficulty, onGameEnd }) => {
    const [grid, setGrid] = useState([]);
    const [nextNumber, setNextNumber] = useState(1);
    const [timer, setTimer] = useState(0);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [wrongTaps, setWrongTaps] = useState(0);
    const [clearedNumbers, setClearedNumbers] = useState([]);
    const [lastWrongPress, setLastWrongPress] = useState(null);
    const intervalRef = useRef(null);
    const gridSize = difficulty * difficulty;
    
    const startGame = () => {
        setNextNumber(1);
        setTimer(0);
        setWrongTaps(0);
        setClearedNumbers([]);
        setLastWrongPress(null);
        generateGrid();
        setIsGameRunning(true);
    };
    
    useEffect(() => {
        startGame(); // 组件加载后立即开始游戏
    }, [difficulty]); 

    useEffect(() => {
        if (isGameRunning) {
            intervalRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isGameRunning]);

    const generateGrid = () => {
        const numbers = Array.from({ length: gridSize }, (_, i) => i + 1);
        // Fisher-Yates shuffle algorithm
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        setGrid(numbers);
    };

    const handlePress = (number) => {
        if (!isGameRunning || clearedNumbers.includes(number)) return;

        if (number !== nextNumber) {
            setWrongTaps(prev => prev + 1);
            setLastWrongPress(number);
            setTimeout(() => setLastWrongPress(null), 300); // 错误提示闪烁300ms
            return;
        }
        
        // 正确点击
        setClearedNumbers(prev => [...prev, number]);

        if (number === gridSize) {
            setIsGameRunning(false);
            const score = timer;
            const bestScore = Math.min(score, 30 + difficulty * 5); // 模拟最佳得分
            onGameEnd({ success: true, score, bestScore, wrongTaps, difficulty });
        } else {
            setNextNumber(nextNumber + 1);
        }
    };

    const gridCellStyle = (number) => {
        const isCleared = clearedNumbers.includes(number);
        const isWrong = lastWrongPress === number;
        
        let style = {...styles.gridCell};
        if(isCleared) style = {...style, ...styles.gridCellCleared};
        if(isWrong) style = {...style, ...styles.gridCellWrong};
        
        // 根据难度调整格子大小
        style.width = difficulty > 5 ? '35px' : '45px';
        style.height = difficulty > 5 ? '35px' : '45px';
        
        return style;
    };

    return (
        <div style={styles.gameContainer}>
            <div style={styles.gameStats}>
                <span style={styles.gameStatText}>下一个: {nextNumber}</span>
                <span style={styles.gameStatText}>时间: {timer}s</span>
                <span style={styles.gameStatText}>错误: {wrongTaps}</span>
            </div>
            <div style={{...styles.schulteGrid, gridTemplateColumns: `repeat(${difficulty}, 1fr)` }}>
                {grid.map((number, index) => (
                    <button key={index} style={gridCellStyle(number)} onClick={() => handlePress(number)}>
                        <span style={{...styles.gridNumber, color: clearedNumbers.includes(number) ? '#AEC6CF' : '#333'}}>{number}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// --- 色彩方格游戏组件 ---
const ColorGridGame = ({ onGameEnd }) => {
    const [gameState, setGameState] = useState('ready'); // ready, memorize, recall, result
    const [pattern, setPattern] = useState([]);
    const [userSelection, setUserSelection] = useState([]);
    const [gameResult, setGameResult] = useState({ correct: 0, total: 0 });
    const gridSize = 9; // 3x3
    const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700']; // 增加一种颜色

    const generatePattern = () => {
        const newPattern = Array(gridSize).fill(null);
        let coloredSquares = 0;
        while (coloredSquares < 5) { // 随机填充5个颜色
            const randomIndex = Math.floor(Math.random() * gridSize);
            if (newPattern[randomIndex] === null) {
                newPattern[randomIndex] = colors[Math.floor(Math.random() * colors.length)];
                coloredSquares++;
            }
        }
        setPattern(newPattern);
        setUserSelection(Array(gridSize).fill(null));
    };
    
    const startGame = () => {
        generatePattern();
        setGameState('memorize');
        setTimeout(() => {
            setGameState('recall');
        }, 3000); // 记忆3秒
    };
    
    const handleCellClick = (index) => {
        if (gameState !== 'recall') return;
        
        const currentUserColor = userSelection[index];
        const currentColorIndex = colors.indexOf(currentUserColor);
        // Cycle through: null -> color1 -> color2 -> ... -> null
        const nextColorIndex = (currentColorIndex + 1) % (colors.length + 1);
        const nextColor = nextColorIndex === colors.length ? null : colors[nextColorIndex];
        
        const newUserSelection = [...userSelection];
        newUserSelection[index] = nextColor;
        setUserSelection(newUserSelection);
    };

    const checkResult = () => {
        let correctColored = 0;
        let totalColoredInPattern = 0;
        for(let i=0; i<gridSize; i++) {
            if(pattern[i] !== null) {
                totalColoredInPattern++;
                if(pattern[i] === userSelection[i]) {
                    correctColored++;
                }
            }
        }
        setGameResult({ correct: correctColored, total: totalColoredInPattern });
        setGameState('result');
    };
    
    if (gameState === 'ready') {
        return (
            <div style={styles.centeredPage}>
                <h1 style={styles.headerTitle}>色彩方格</h1>
                <p>准备好记住颜色了吗？</p>
                <button style={styles.primaryButton} onClick={startGame}>开始挑战</button>
            </div>
        );
    }
    
    if (gameState === 'memorize') {
        return (
            <div style={styles.centeredPage}>
                <h2 style={{color: '#333'}}>记住图案！</h2>
                 <div style={{...styles.schulteGrid, gridTemplateColumns: `repeat(3, 1fr)` }}>
                    {pattern.map((color, index) => (
                        <div key={index} style={{...styles.gridCell, backgroundColor: color || '#FFF'}}></div>
                    ))}
                 </div>
            </div>
        );
    }

    if (gameState === 'recall') {
        return (
             <div style={styles.centeredPage}>
                 <h2 style={{color: '#333'}}>复原图案！</h2>
                 <div style={{...styles.schulteGrid, gridTemplateColumns: `repeat(3, 1fr)` }}>
                     {userSelection.map((color, index) => (
                         <button key={index} style={{...styles.gridCell, backgroundColor: color || '#FFF'}} onClick={() => handleCellClick(index)}></button>
                     ))}
                 </div>
                 <button style={{...styles.primaryButton, marginTop: '20px'}} onClick={checkResult}>完成</button>
             </div>
        );
    }

    if (gameState === 'result') {
        return (
             <div style={styles.centeredPage}>
                 <h1 style={styles.headerTitle}>挑战完成!</h1>
                 <p style={styles.resultText}>你答对了 {gameResult.correct} / {gameResult.total} 个！</p>
                 <div style={styles.buttonRow}>
                    <button style={styles.secondaryButton} onClick={startGame}>再玩一次</button>
                    <button style={styles.primaryButton} onClick={onGameEnd}>返回训练</button>
                 </div>
             </div>
        );
    }

    return null;
};


// --- 分享模态框 ---
const ShareModal = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    const handleShare = (platform) => {
        alert(`已模拟分享到 ${platform}`);
        onClose();
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.shareSheet} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.shareTitle}>分享给好友</h3>
                <div style={styles.shareGrid}>
                    <button style={styles.shareItem} onClick={() => handleShare('微信好友')}>
                        <Icon name="微" size={48} color="#2ECC71"/>
                        <p style={styles.shareLabel}>微信好友</p>
                    </button>
                    <button style={styles.shareItem} onClick={() => handleShare('朋友圈')}>
                         <Icon name="圈" size={48} color="#27AE60"/>
                        <p style={styles.shareLabel}>朋友圈</p>
                    </button>
                    <button style={styles.shareItem} onClick={() => handleShare('复制链接')}>
                        <Icon name="链" size={48} color="#3498DB"/>
                        <p style={styles.shareLabel}>复制链接</p>
                    </button>
                    <button style={styles.shareItem} onClick={() => handleShare('生成海报')}>
                        <Icon name="报" size={48} color="#9B59B6"/>
                        <p style={styles.shareLabel}>生成海报</p>
                    </button>
                </div>
                <button style={styles.cancelButton} onClick={onClose}>取消</button>
            </div>
        </div>
    );
};

// --- 内容渲染组件 ---
const ScreenRenderer = (props) => {
    const {
        currentScreen,
        activeTab,
        isFirstLaunch,
        onboardingStep,
        setOnboardingStep,
        user,
        tempUser,
        setTempUser,
        completeOnboarding,
        partners,
        navigate,
        goBack,
        schulteDifficulty,
        setSchulteDifficulty,
        setIsRulesModalVisible,
        gameResult,
        setGameResult,
        setHistory,
        setCurrentScreen,
        setActiveTab,
        todayTrainingData,
        assessmentInfo,
        handleAssessmentInfoChange,
        setScores,
        setAssessmentStep,
        assessmentStep,
        assessmentQuestions,
        selectedOption,
        setSelectedOption,
        handleNextQuestion,
        isLoggedIn,
        rechartsLoaded,
        scores,
        aiAnalysis,
        isGeneratingAnalysis,
        generateAiAnalysis,
        messages,
        isAiTyping,
        chatEndRef,
        isStoryPromptVisible,
        setIsStoryPromptVisible,
        storyTopic,
        setStoryTopic,
        handleGenerateStory,
        inputText,
        setInputText,
        handleSendMessage,
        handleSendVoiceMessage,
        activeCourseTab,
        setActiveCourseTab,
        courseData,
        currentVideo,
        trainingData,
        setIsLoggedIn,
        setUser,
        setIsShareModalVisible,
        babies,
        newBaby,
        setNewBaby,
        setBabies,
        feedbackText,
        setFeedbackText,
        soundEnabled,
        setSoundEnabled,
        vibrationEnabled,
        setVibrationEnabled,
    } = props;
    
    // --- 新手引导 ---
    if (isFirstLaunch) {
         switch(onboardingStep) {
            case 'welcome':
                return (
                    <div style={styles.onboardingWelcome}>
                         <img src={user.avatar} alt="AI伙伴" style={{...styles.aiDoll, width: 200, height: 200, marginBottom: 20}} />
                         <h1 style={{color: '#fff'}}>你好，我是你的新伙伴！</h1>
                         <p style={{color: '#fff'}}>我将陪你一起开启有趣的专注力旅程！</p>
                         <button style={{...styles.primaryButton, marginTop: 30}} onClick={() => setOnboardingStep('permissions')}>我们开始吧！</button>
                    </div>
                );
            case 'permissions':
                return (
                    <div style={styles.centeredPage}>
                        <h2 style={styles.headerTitle}>我们需要一些权限</h2>
                        <div style={styles.permissionItem}>
                            <h3>麦克风权限</h3>
                            <p>用于语音聊天和部分声控游戏，让互动更有趣！</p>
                        </div>
                        <div style={styles.permissionItem}>
                            <h3>通知权限</h3>
                            <p>用于提醒你每日训练，不错过任何一次进步的机会！</p>
                        </div>
                         <button style={{...styles.primaryButton, marginTop: 30}} onClick={() => setOnboardingStep('profile')}>好的，我明白了</button>
                    </div>
                );
             case 'profile':
                return (
                    <div style={styles.page}>
                         <h1 style={styles.headerTitle}>创建你的专属档案</h1>
                        <input placeholder="请输入你的昵称" style={styles.input} value={tempUser.name} onChange={(e) => setTempUser({...tempUser, name: e.target.value})}/>
                        <input placeholder="你的年龄" type="number" style={styles.input} value={tempUser.age} onChange={(e) => setTempUser({...tempUser, age: e.target.value})}/>
                         <div style={styles.genderSelector}>
                             <p style={styles.inputLabel}>你的性别:</p>
                             <button onClick={() => setTempUser({...tempUser, gender: 'boy'})} style={tempUser.gender === 'boy' ? styles.genderButtonSelected : styles.genderButton}>男孩</button>
                             <button onClick={() => setTempUser({...tempUser, gender: 'girl'})} style={tempUser.gender === 'girl' ? styles.genderButtonSelected : styles.genderButton}>女孩</button>
                         </div>
                         <button style={styles.primaryButton} onClick={() => setOnboardingStep('partner')}>下一步</button>
                    </div>
                );
            case 'partner':
                return (
                     <div style={styles.page}>
                         <h1 style={styles.headerTitle}>选择你的AI伙伴</h1>
                         <div style={styles.partnerSelectionGrid}>
                             {partners.map(p => (
                                 <div 
                                    key={p.name} 
                                    style={tempUser.avatar === p.img ? styles.partnerCardSelected : styles.partnerCard}
                                    onClick={() => setTempUser({...tempUser, avatar: p.img})}
                                >
                                     <img src={p.img} alt={p.name} style={{width: '100%', height: 'auto', borderRadius: '15px'}}/>
                                     <p style={{textAlign: 'center', fontWeight: 'bold'}}>{p.name}</p>
                                 </div>
                             ))}
                         </div>
                          <button style={styles.primaryButton} onClick={() => setOnboardingStep('assessmentPrompt')}>就选它了！</button>
                     </div>
                );
            case 'assessmentPrompt':
                 return (
                    <div style={styles.centeredPage}>
                        <h1 style={styles.headerTitle}>太棒了！</h1>
                        <p style={{textAlign: 'center', marginBottom: 20}}>在开始前，要不要先来一个快速小测评，让我更了解你呢？（大约需要3分钟）</p>
                        <div style={{...styles.buttonRow, flexDirection: 'column', gap: 15, width: '80%'}}>
                             <button style={{...styles.primaryButton, width: '100%'}} onClick={() => completeOnboarding(true)}>立即开始测评</button>
                             <button style={{...styles.secondaryButton, width: '100%'}} onClick={() => completeOnboarding(false)}>稍后再说</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }
    
    // --- 游戏流程 ---
    if (currentScreen === 'SchulteDifficulty') {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>选择难度</h1>
                <div style={styles.difficultyGrid}>
                    {[3, 4, 5, 6, 7, 8].map(d => (
                        <button key={d} style={styles.difficultyButton} onClick={() => { setSchulteDifficulty(d); setIsRulesModalVisible(true); }}>
                            <span style={styles.difficultyButtonText}>{d} x {d}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    if (currentScreen === 'SchulteGame' && schulteDifficulty) {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <SchulteGame difficulty={schulteDifficulty} onGameEnd={(result) => { setGameResult(result); navigate('GameResult'); }}/>
            </div>
        );
    }
    if (currentScreen === 'GameResult' && gameResult) {
        const getMedal = (time) => {
            const difficulty = gameResult.difficulty || 3;
            if(time < (difficulty * difficulty * 0.8)) return '🥇 金牌';
            if(time < (difficulty * difficulty * 1.5)) return '🥈 银牌';
            return '🥉 铜牌';
        }
        return (
            <div style={styles.centeredPage}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>{gameResult.success ? "挑战成功!" : "挑战失败"}</h1>
                <div style={styles.resultBox}>
                    <p style={styles.resultText}>时间徽章: {getMedal(gameResult.score)}</p>
                    <p style={styles.resultText}>本次用时: {gameResult.score}s</p>
                    <p style={styles.resultText}>历史最佳: {gameResult.bestScore}s</p>
                    <p style={styles.resultText}>错误次数: {gameResult.wrongTaps}</p>
                </div>
                <div style={styles.buttonRow}>
                    <button style={styles.secondaryButton} onClick={() => {
                         const newHistory = [...history];
                         newHistory.pop();
                         newHistory.pop();
                         setHistory(newHistory);
                         setCurrentScreen('SchulteGame');
                    }}>
                        <span style={styles.secondaryButtonText}>重新挑战</span>
                    </button>
                    <button style={styles.primaryButton} onClick={() => { setActiveTab('首页'); setCurrentScreen('Home'); setHistory(['Home']);}}>
                        <span style={styles.primaryButtonText}>回到首页</span>
                    </button>
                </div>
            </div>
        );
    }
    if(currentScreen === 'ColorGridGame') {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <ColorGridGame onGameEnd={() => goBack()} />
            </div>
        );
    }
    // --- 今日训练页面 ---
    if (currentScreen === 'TodayTraining') {
        return (
            <div style={{...styles.page, overflowY: 'auto'}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>今日训练</h1>
                 <div style={styles.trainingList}>
                    {todayTrainingData.map(item => (
                        <button key={item.id} style={styles.trainingListItemButton} onClick={() => navigate(item.screen)}>
                            <Icon name={item.icon} size={40} color={'#1E90FF'}/>
                            <p style={styles.trainingListItemText}>{item.name}</p>
                            <StarRating rating={item.completed ? item.rating : 0} />
                        </button>
                    ))}
                 </div>
            </div>
        );
    }
    // --- 测评流程 ---
    if (currentScreen === 'AssessmentInfo') {
         return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>注意力测评</h1>
                <input 
                    placeholder="宝贝名称" 
                    style={styles.input} 
                    value={assessmentInfo.name}
                    onChange={(e) => handleAssessmentInfoChange('name', e.target.value)}
                />
                <input 
                    placeholder="年龄" 
                    type="number" 
                    style={styles.input} 
                    value={assessmentInfo.age}
                    onChange={(e) => handleAssessmentInfoChange('age', e.target.value)}
                />
                 <div style={styles.genderSelector}>
                     <p style={styles.inputLabel}>性别:</p>
                     <button onClick={() => handleAssessmentInfoChange('gender', 'boy')} style={assessmentInfo.gender === 'boy' ? styles.genderButtonSelected : styles.genderButton}>男孩</button>
                     <button onClick={() => handleAssessmentInfoChange('gender', 'girl')} style={assessmentInfo.gender === 'girl' ? styles.genderButtonSelected : styles.genderButton}>女孩</button>
                 </div>
                <button style={styles.primaryButton} onClick={() => { setScores([]); setAssessmentStep(1); navigate('AssessmentQuestions'); }}>
                    <span style={styles.primaryButtonText}>开始答题</span>
                </button>
            </div>
        );
    }
     if (currentScreen === 'AssessmentQuestions') {
        const isLastQuestion = assessmentStep === assessmentQuestions.length;
        const buttonText = isLastQuestion ? '完成' : '下一题';
        const currentQ = assessmentQuestions[assessmentStep - 1];
        if (!currentQ) return null; // 防止数组越界
        return (
            <div style={styles.page}>
                <h1 style={styles.headerTitle}>第 {assessmentStep} / {assessmentQuestions.length} 题</h1>
                <div style={styles.progressBar}><div style={{ width: `${assessmentStep / assessmentQuestions.length * 100}%`, backgroundColor: '#4A90E2', height: '100%' }} /></div>
                <p style={styles.questionText}>{currentQ.q}</p>
                {Object.entries(currentQ.options).map(([key, value]) => (
                    <button key={key} onClick={() => setSelectedOption(key)} style={selectedOption === key ? styles.optionButtonSelected : styles.optionButton}>
                        <p style={styles.optionText}>{`${key}. ${value}`}</p>
                    </button>
                ))}
                <button style={selectedOption ? styles.primaryButton : styles.primaryButtonDisabled} onClick={handleNextQuestion} disabled={!selectedOption}>
                    <span style={styles.primaryButtonText}>{buttonText}</span>
                </button>
            </div>
        );
    }
     if (currentScreen === 'AssessmentResultPrompt') {
        return (
            <div style={styles.centeredPage}>
                <h1 style={styles.headerTitle}>测评完成！</h1>
                <div style={styles.buttonRow}>
                    <button style={styles.secondaryButton} onClick={() => { setActiveTab('首页'); setCurrentScreen('Home'); setHistory(['Home']); }}>
                       <span style={styles.secondaryButtonText}>回到首页</span>
                    </button>
                     <button style={styles.primaryButton} onClick={() => navigate('Report')}>
                       <span style={styles.primaryButtonText}>查看报告</span>
                    </button>
                </div>
            </div>
        );
    }
    
     // --- 二级页面 ---
     if (currentScreen === 'CheckIn') {
         return (
             <div style={{...styles.page, overflowY: 'auto'}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>打卡日历</h1>
                 <Calendar />
             </div>
         );
     }
     if (currentScreen === 'Membership') {
         return (
             <div style={{...styles.page, overflowY: 'auto'}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>订阅超值会员</h1>
                 <div style={styles.membershipContainer}>
                    <div style={styles.membershipCard}>
                        <h2 style={styles.membershipTitle}>7日体验会员</h2>
                        <p style={styles.membershipPrice}>¥ 6</p>
                        <p style={styles.membershipDesc}>解锁全部游戏7天</p>
                        <button style={styles.primaryButton}>立即开通</button>
                    </div>
                    <div style={{...styles.membershipCard, ...styles.membershipCardRecommended}}>
                        <span style={styles.recommendedBadge}>推荐</span>
                        <h2 style={styles.membershipTitle}>月度会员</h2>
                        <p style={styles.membershipPrice}>¥ 30</p>
                        <p style={styles.membershipDesc}>畅玩全部内容30天</p>
                        <button style={styles.primaryButton}>立即开通</button>
                    </div>
                    <div style={styles.membershipCard}>
                        <h2 style={styles.membershipTitle}>年度会员</h2>
                        <p style={styles.membershipPrice}>¥ 198</p>
                        <p style={styles.membershipDesc}>超值一整年</p>
                        <button style={styles.primaryButton}>立即开通</button>
                    </div>
                 </div>
             </div>
         );
     }
     if (currentScreen === 'AIChat') {
         return (
            <div style={styles.chatContainer}>
                <div style={styles.chatHeader}>
                    <button onClick={goBack} style={styles.backButtonChat}>返回</button>
                    <h1 style={styles.chatHeaderTitle}>和AI伙伴聊天</h1>
                </div>
                <div style={styles.messageList}>
                    {messages.map(msg => (
                        <div key={msg.id} style={msg.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer}>
                            {msg.sender === 'ai' && <Icon name="AI" size={30} color="#4A90E2" />}
                            <div style={msg.sender === 'user' ? styles.userMessageBubble : styles.aiMessageBubble}>
                                <p style={styles.messageText} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                            </div>
                        </div>
                    ))}
                    {isAiTyping && <div style={styles.typingIndicator}>伙伴正在输入...</div>}
                     <div ref={chatEndRef} />
                </div>
                 {isStoryPromptVisible && (
                    <div style={styles.modalOverlay} onClick={() => setIsStoryPromptVisible(false)}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h3 style={styles.modalTitle}>想听什么故事？</h3>
                            <input
                                style={styles.input}
                                placeholder="比如：一只会飞的小猪"
                                value={storyTopic}
                                onChange={(e) => setStoryTopic(e.target.value)}
                            />
                            <button style={styles.primaryButton} onClick={handleGenerateStory}>
                                <span style={styles.primaryButtonText}>开始讲述！</span>
                            </button>
                        </div>
                    </div>
                )}
                <div style={styles.chatInputContainer}>
                    <button style={styles.voiceButton} onClick={handleSendVoiceMessage}>🎤</button>
                    <input
                        type="text"
                        style={styles.chatInput}
                        placeholder="和伙伴说点什么..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                     <button style={styles.storyButton} onClick={() => setIsStoryPromptVisible(true)}>✨</button>
                    <button style={styles.sendButton} onClick={handleSendMessage}>发送</button>
                </div>
            </div>
        );
     }
     if (currentScreen === 'Report') {
        if (!rechartsLoaded) {
            return (
                <div style={{...styles.page, ...styles.centeredPage}}>
                     <button onClick={goBack} style={styles.backButton}>返回</button>
                     <p>图表库加载中...</p>
                </div>
            )
        }
        const { RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const radarData = [
            { subject: '注意力', A: (scores[0] || 0) * 10 + (scores[5] || 0) * 10, B: 40, fullMark: 60 },
            { subject: '冲动控制', A: (scores[1] || 0) * 10 + (scores[7] || 0) * 10, B: 45, fullMark: 60 },
            { subject: '活动水平', A: (scores[2] || 0) * 10 + (scores[6] || 0) * 10, B: 35, fullMark: 60 },
            { subject: '情绪管理', A: (scores[9] || 0) * 20, B: 40, fullMark: 60 },
            { subject: '任务执行', A: (scores[8] || 0) * 20, B: 50, fullMark: 60 },
            { subject: '工作记忆', A: (scores[3] || 0) * 20, B: 48, fullMark: 60 },
        ];
        const lineData = [
            { date: '5月1日', '综合得分': 22 },
            { date: '5月15日', '综合得分': 25 },
            { date: '6月1日', '综合得分': 24 },
            { date: '6月15日', '综合得分': totalScore },
        ];

         return (
             <div style={{...styles.page, overflowY: 'auto'}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>{assessmentInfo.name || '宝贝'}的测评报告</h1>
                 
                 <div style={styles.chartContainer}>
                     <h2 style={styles.sectionTitle}>各项能力对比</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <Radar name="本次得分" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Radar name="同龄平均" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                            <Legend />
                        </RadarChart>
                     </ResponsiveContainer>
                 </div>
                 
                  <div style={styles.chartContainer}>
                     <h2 style={styles.sectionTitle}>进步趋势</h2>
                      <ResponsiveContainer width="100%" height={250}>
                         <LineChart data={lineData}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="date" />
                             <YAxis />
                             <Tooltip />
                             <Legend />
                             <Line type="monotone" dataKey="综合得分" stroke="#8884d8" activeDot={{ r: 8 }} />
                         </LineChart>
                      </ResponsiveContainer>
                 </div>

                 <div style={styles.aiAnalysisContainer}>
                     <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h2 style={{...styles.sectionTitle, paddingLeft: 0}}>AI解读与建议</h2>
                        <button onClick={generateAiAnalysis} disabled={isGeneratingAnalysis} style={styles.primaryButton}>
                           {isGeneratingAnalysis ? '生成中...' : '✨ 生成AI解读'}
                        </button>
                     </div>
                     {isGeneratingAnalysis ? <p style={styles.aiText}>AI专家正在分析报告，请稍候...</p> : null}
                     {aiAnalysis ? (
                        <div style={styles.aiText} dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />').replace(/【/g, '<strong>').replace(/】/g, '</strong>') }}></div>
                     ) : (
                        !isGeneratingAnalysis && <p style={styles.aiText}>点击按钮，让AI为你分析报告并提供专属建议吧！</p>
                     )}
                 </div>
             </div>
         );
     }
    if (currentScreen === 'AvatarSettings') {
         return (
             <div style={{...styles.page, overflowY: 'auto'}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>头像设置</h1>
                 <p style={{textAlign: 'center'}}>点击下方按钮模拟选择照片。</p>
                 <button style={styles.primaryButton} onClick={() => alert('模拟调用系统照片或拍照功能')}>选择照片</button>
             </div>
         );
     }
    if (currentScreen === 'FocusIntro') {
         return (
             <div style={{...styles.page, overflowY: 'auto'}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>专注力介绍</h1>
                 <p style={{ lineHeight: 1.6 }}>专注力，又称注意力，是我们的心理活动指向和集中于某种事物的能力。它是所有智力活动的基础...</p>
                 <img src="https://placehold.co/345x194/AEC6CF/FFFFFF?text=专注力介绍视频" alt="专注力介绍视频" style={styles.banner} />
             </div>
         );
     }
     if (currentScreen === 'VideoPlayer') {
         return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>{currentVideo?.title}</h1>
                <img src="https://placehold.co/345x194/000000/FFFFFF?text=视频播放中..." alt={currentVideo?.title} style={styles.banner} />
                <p>视频正在播放...</p>
            </div>
         );
     }
     if (currentScreen === 'ComingSoon') {
         return (
            <div style={styles.centeredPage}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>敬请期待</h1>
                 <p>新游戏正在开发中，很快就和大家见面啦！</p>
            </div>
         );
     }
     
    // --- 新增'我的'模块相关页面 ---
    if (currentScreen === 'SystemSettings') {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>系统设置</h1>
                <div style={styles.settingItem}>
                    <p>声音开关</p>
                    <button onClick={() => setSoundEnabled(!soundEnabled)} style={soundEnabled ? styles.switchOn : styles.switchOff}>
                        <span style={soundEnabled ? styles.switchHandleOn : styles.switchHandleOff}></span>
                    </button>
                </div>
                <div style={styles.settingItem}>
                    <p>手机键盘震动开关</p>
                    <button onClick={() => setVibrationEnabled(!vibrationEnabled)} style={vibrationEnabled ? styles.switchOn : styles.switchOff}>
                         <span style={vibrationEnabled ? styles.switchHandleOn : styles.switchHandleOff}></span>
                    </button>
                </div>
            </div>
        );
    }
    if (currentScreen === 'LoginRegister') {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>登录/注册</h1>
                <input placeholder="手机号" style={styles.input} />
                <input placeholder="验证码" style={styles.input} />
                <button style={styles.primaryButton} onClick={() => { setIsLoggedIn(true); goBack(); }}>登录</button>
            </div>
        );
    }
    if (currentScreen === 'UserProfile') {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>个人资料</h1>
                <div style={styles.settingItem} onClick={() => alert('模拟调用系统照片或拍照功能')}>
                    <p>头像设置</p>
                    <img src={tempUser.avatar} style={{width: 40, height: 40, borderRadius: 20}} alt="头像" />
                </div>
                 <div style={styles.settingItem}>
                    <p>昵称设置</p>
                    <input value={tempUser.name} onChange={e => setTempUser({...tempUser, name: e.target.value})} style={{...styles.input, marginBottom: 0, textAlign: 'right', border: 'none'}} />
                </div>
                 <div style={styles.settingItem}>
                    <p>性别设置</p>
                    <div>
                         <button onClick={() => setTempUser({...tempUser, gender: 'boy'})} style={tempUser.gender === 'boy' ? styles.genderButtonSelected : styles.genderButton}>男</button>
                         <button onClick={() => setTempUser({...tempUser, gender: 'girl'})} style={tempUser.gender === 'girl' ? styles.genderButtonSelected : styles.genderButton}>女</button>
                    </div>
                </div>
                 <div style={styles.settingItem}>
                    <p>年龄设置</p>
                    <input type="number" value={tempUser.age} onChange={e => setTempUser({...tempUser, age: e.target.value})} style={{...styles.input, marginBottom: 0, textAlign: 'right', border: 'none'}}/>
                </div>
                <button style={{...styles.primaryButton, width: '100%', marginTop: '20px'}} onClick={() => { setUser(tempUser); goBack(); }}>保存</button>
                <button style={{...styles.secondaryButton, width: '100%', marginTop: '10px', borderColor: '#e74c3c', color: '#e74c3c'}} onClick={() => { setIsLoggedIn(false); goBack(); }}>退出登录</button>
            </div>
        );
    }
    if (currentScreen === 'StickerCollection') {
        return (
             <div style={{...styles.page, overflowY: 'auto'}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>贴纸收藏</h1>
                 <div style={styles.grid}>
                    {[...Array(8)].map((_, i) => (
                         <div key={i} style={styles.stickerItem}>
                             <img src={`https://placehold.co/100x100/FFD700/000000?text=贴纸${i+1}`} alt={`贴纸${i+1}`} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                         </div>
                    ))}
                 </div>
             </div>
        );
    }
     if (currentScreen === 'ContactUs') {
        return (
             <div style={{...styles.page, ...styles.centeredPage}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <h1 style={styles.headerTitle}>联系我们</h1>
                 <img src="https://placehold.co/200x200/ffffff/000000?text=二维码" alt="二维码" style={{marginBottom: '20px'}}/>
                 <p>扫码添加客服微信</p>
             </div>
        );
    }
     if (currentScreen === 'AboutUs') {
        return (
             <div style={{...styles.page, ...styles.centeredPage}}>
                 <button onClick={goBack} style={styles.backButton}>返回</button>
                 <Icon name="趣味" size={60} color="#4A90E2"/>
                 <h1 style={{...styles.headerTitle, marginTop: '10px'}}>趣味专注训练营</h1>
                 <p>版号: 1.0.0</p>
             </div>
        );
    }
     if (currentScreen === 'AddBaby') {
         const handleAddBaby = () => {
             if(newBaby.name && newBaby.dob && newBaby.gender) {
                 setBabies(prev => [...prev, {...newBaby, id: Date.now()}]);
                 setNewBaby({ name: '', gender: null, dob: ''});
                 goBack();
             } else {
                 alert("请填写完整的宝贝信息！");
             }
         }
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>添加宝贝</h1>
                <div style={{...styles.settingItem, justifyContent: 'center'}} onClick={() => alert('模拟调用系统照片或拍照功能')}>
                    <img src={'https://placehold.co/80x80/cccccc/888888?text=头像'} style={{width: 80, height: 80, borderRadius: 40}} alt="头像" />
                </div>
                <input placeholder="宝贝昵称" style={styles.input} value={newBaby.name} onChange={e => setNewBaby({...newBaby, name: e.target.value})} />
                 <div style={styles.genderSelector}>
                     <p style={styles.inputLabel}>性别:</p>
                     <button onClick={() => setNewBaby({...newBaby, gender: 'boy'})} style={newBaby.gender === 'boy' ? styles.genderButtonSelected : styles.genderButton}>男孩</button>
                     <button onClick={() => setNewBaby({...newBaby, gender: 'girl'})} style={newBaby.gender === 'girl' ? styles.genderButtonSelected : styles.genderButton}>女孩</button>
                 </div>
                  <p style={styles.inputLabel}>出生年月日:</p>
                 <input type="date" style={styles.input} value={newBaby.dob} onChange={e => setNewBaby({...newBaby, dob: e.target.value})} />
                <button style={{...styles.primaryButton, width: '100%', marginTop: '20px'}} onClick={handleAddBaby}>完成</button>
            </div>
        );
    }
     if (currentScreen === 'PurchaseHistory') {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>购买记录</h1>
                <div style={styles.menuList}>
                    <div style={styles.settingItem}>
                       <div>
                            <p style={{margin: 0, fontWeight: 'bold'}}>年度会员</p>
                            <p style={{margin: '5px 0 0 0', fontSize: '12px', color: '#888'}}>订单ID: 123456789</p>
                       </div>
                       <p>2024-05-20</p>
                    </div>
                     <div style={styles.settingItem}>
                       <div>
                            <p style={{margin: 0, fontWeight: 'bold'}}>月度会员</p>
                            <p style={{margin: '5px 0 0 0', fontSize: '12px', color: '#888'}}>订单ID: 987654321</p>
                       </div>
                       <p>2024-04-20</p>
                    </div>
                </div>
            </div>
        );
    }
     if (currentScreen === 'Feedback') {
        return (
            <div style={styles.page}>
                <button onClick={goBack} style={styles.backButton}>返回</button>
                <h1 style={styles.headerTitle}>意见反馈</h1>
                <textarea 
                    style={styles.feedbackInput}
                    placeholder="请输入您的意见和建议..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                />
                <button style={{...styles.primaryButton, marginTop: 20}} onClick={() => { alert('反馈已提交，感谢您的支持！'); goBack(); }}>提交</button>
            </div>
        );
    }
    
    switch (activeTab) {
        case '首页':
            return (
                <div style={styles.page}>
                    <div style={styles.homeHeader}>
                        <button style={styles.headerButton} onClick={() => navigate('CheckIn')}><Icon name="打" /><p>打卡</p></button>
                        <button style={styles.headerButton} onClick={() => navigate('Membership')}><Icon name="会" color="#FFD700" /><p>订阅会员</p></button>
                    </div>
                    <div style={styles.aiCompanionContainer}>
                        <div style={{position: 'relative', cursor: 'pointer'}} onClick={() => navigate('AIChat')}>
                            <div style={styles.aiBubble}><p style={styles.aiBubbleText}>你好呀～小朋友！</p></div>
                            <img src={user.avatar} alt="AI伙伴" style={styles.aiDoll} />
                        </div>
                    </div>
                    <div style={styles.sideButtonsContainer}>
                        <button style={styles.sideButton} onClick={() => navigate('UserProfile')}><img src={user.avatar} style={{width: 40, height: 40, borderRadius: '50%'}} alt="头像缩略图"/></button>
                        <button style={styles.sideButton} onClick={() => navigate('FocusIntro')}><Icon name="介" size={24} /></button>
                        <button style={styles.sideButton} onClick={() => navigate('AssessmentInfo')}><Icon name="测" size={24} /></button>
                    </div>
                    <div style={styles.bottomEntrances}>
                        <button style={styles.entranceCard} onClick={() => navigate('SchulteDifficulty')}><Icon name="舒" size={30} /><p style={styles.entranceText}>舒尔特方格</p></button>
                        <button style={styles.entranceCard} onClick={() => navigate('TodayTraining')}><Icon name="今" size={30} /><p style={styles.entranceText}>今日训练</p><StarRating rating={3} /></button>
                    </div>
                </div>
            );
        case '课程':
             return (
                <div style={{...styles.page, overflowY: 'auto'}}>
                     <h1 style={styles.headerTitle}>课程</h1>
                     <div style={styles.courseTabContainer}>
                         {Object.keys(courseData).map(tabName => (
                             <button
                                 key={tabName}
                                 style={activeCourseTab === tabName ? styles.courseTabActive : styles.courseTab}
                                 onClick={() => setActiveCourseTab(tabName)}
                             >
                                 {tabName}
                             </button>
                         ))}
                     </div>
                    <div style={styles.grid}>
                         {courseData[activeCourseTab].map(video => (
                             <button key={video.id} style={styles.videoItemButton} onClick={() => navigate('VideoPlayer', video)}>
                                 <img src={video.thumbnail} alt={video.title} style={styles.videoThumbnail} />
                                 <p style={styles.videoTitle}>{video.title}</p>
                             </button>
                         ))}
                    </div>
                </div>
            );
        case '训练':
            return (
                <div style={{...styles.page, overflowY: 'auto'}}>
                     <h1 style={styles.headerTitle}>训练</h1>
                    <button onClick={() => navigate('SchulteDifficulty')} style={{border:'none', padding:0, background:'none', cursor:'pointer', width: '100%'}}>
                       <img src="https://placehold.co/345x194/AEC6CF/FFFFFF?text=舒尔特方格挑战" alt="舒尔特方格挑战" style={styles.banner} />
                    </button>
                    {trainingData.map(category => (
                        <div key={category.category} style={styles.trainingSection}>
                            <h2 style={styles.sectionTitle}>{category.category}</h2>
                            <div style={styles.gameGrid}>
                                {category.games.map(game => (
                                    <button key={game.name} style={styles.gameIcon} onClick={() => navigate(game.screen)}>
                                        <Icon name={game.name} size={48} color="#1E90FF"/>
                                        <p style={styles.gameIconLabel}>{game.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        case '我的':
            return (
                 <div style={{...styles.page, overflowY: 'auto'}}>
                    <div style={styles.profileHeader} onClick={() => isLoggedIn ? navigate('UserProfile') : navigate('LoginRegister')}>
                        <img src={isLoggedIn ? user.avatar : 'https://placehold.co/60x60/cccccc/888888?text=未登录'} alt="头像" style={styles.avatar} />
                        <div>
                            <p style={styles.profileName}>{isLoggedIn ? user.name : '未登录'}</p>
                            {isLoggedIn && <p style={styles.profileId}>ID: {user.id}</p>}
                        </div>
                         <button onClick={(e) => { e.stopPropagation(); navigate('SystemSettings'); }} style={{ marginLeft: 'auto', background: 'none', border: 'none' }}><Icon name="设" /></button>
                    </div>
                    <button style={styles.shareBanner} onClick={() => setIsShareModalVisible(true)}><p style={styles.shareBannerText}>分享给好友，一起进步！</p></button>
                    <div style={styles.myQuickLinks}>
                        <button style={styles.quickLinkItem} onClick={() => navigate('Report')}><Icon name="报"/><p>测评报告</p></button>
                        <button style={styles.quickLinkItem} onClick={() => navigate('StickerCollection')}><Icon name="贴"/><p>贴纸收藏</p></button>
                        <button style={styles.quickLinkItem} onClick={() => navigate('ContactUs')}><Icon name="联"/><p>联系我们</p></button>
                        <button style={styles.quickLinkItem} onClick={() => navigate('AboutUs')}><Icon name="关"/><p>关于我们</p></button>
                    </div>
                     <div style={styles.menuList}>
                         <h3 style={styles.sectionTitle}>我的宝贝</h3>
                         {babies.length > 0 ? (
                             babies.map(baby => (
                                 <div key={baby.id} style={styles.babyItem}>
                                     <img src="https://placehold.co/40x40/AEC6CF/FFFFFF?text=宝" alt="宝贝头像" style={{borderRadius: 20, marginRight: 10}}/>
                                     <span>{baby.name}</span>
                                 </div>
                             ))
                         ) : null}
                        <button style={styles.menuItem} onClick={() => navigate('AddBaby')}>
                            <p>+ 添加宝贝</p>
                        </button>
                     </div>
                    <div style={{...styles.menuList, marginTop: '15px'}}>
                        <button style={styles.menuItem} onClick={() => navigate('PurchaseHistory')}><p>购买记录</p><p>&gt;</p></button>
                        <button style={styles.menuItem} onClick={() => navigate('Feedback')}><p>意见反馈</p><p>&gt;</p></button>
                    </div>
                </div>
            );
        default:
            return <div></div>;
    }
};

// --- 主应用组件 (Web版本) ---
const App = () => {
    // 导航状态
    const [activeTab, setActiveTab] = useState('首页');
    const [currentScreen, setCurrentScreen] = useState('Home');
    const [history, setHistory] = useState(['Home']);
    const [rechartsLoaded, setRechartsLoaded] = useState(false);
    
    // 新用户引导流程状态
    const [isFirstLaunch, setIsFirstLaunch] = useState(true); // 设为true以启动引导流程
    const [onboardingStep, setOnboardingStep] = useState('welcome');
    
    // 认证和用户状态
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({
        name: '小可爱',
        id: '123456',
        avatar: 'https://placehold.co/150x150/f2c94c/000?text=精灵',
        gender: 'girl',
        age: '5'
    });
    const [tempUser, setTempUser] = useState({ name: '', gender: null, age: '' });
    const [babies, setBabies] = useState([]);
    const [newBaby, setNewBaby] = useState({ name: '', gender: null, dob: ''});

    // 系统设置状态
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    
    // 课程模块状态
    const [activeCourseTab, setActiveCourseTab] = useState('正念冥想');
    const [currentVideo, setCurrentVideo] = useState(null);

    // 游戏状态
    const [schulteDifficulty, setSchulteDifficulty] = useState(null);
    const [isRulesModalVisible, setIsRulesModalVisible] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    
    // 分享模态框状态
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    
    // 意见反馈状态
    const [feedbackText, setFeedbackText] = useState('');

    // 今日训练模拟数据
    const todayTrainingData = [
        { id: 1, name: '舒尔特方格', icon: '舒', rating: 5, completed: true, screen: 'SchulteDifficulty' },
        { id: 2, name: '连线训练', icon: '连', rating: 3, completed: true, screen: 'ComingSoon' },
        { id: 3, name: '找不同', icon: '找', rating: 0, completed: false, screen: 'ComingSoon' },
        { id: 4, name: '记忆挑战', icon: '记', rating: 4, completed: true, screen: 'ComingSoon' },
        { id: 5, name: '色彩方格', icon: '色', rating: 0, completed: false, screen: 'ColorGridGame' },
    ];
    
    // 课程视频模拟数据
    const courseData = {
        '正念冥想': [
            { id: 1, title: '平静的呼吸', thumbnail: 'https://placehold.co/160x90/AEC6CF/FFFFFF?text=冥想1' },
            { id: 2, title: '身体扫描', thumbnail: 'https://placehold.co/160x90/AEC6CF/FFFFFF?text=冥想2' },
            { id: 3, title: '声音的旅程', thumbnail: 'https://placehold.co/160x90/AEC6CF/FFFFFF?text=冥想3' },
            { id: 4, title: '友善的想法', thumbnail: 'https://placehold.co/160x90/AEC6CF/FFFFFF?text=冥想4' },
        ],
        '感统训练': [
            { id: 5, title: '跳跃的袋鼠', thumbnail: 'https://placehold.co/160x90/FFC0CB/FFFFFF?text=感统1' },
            { id: 6, title: '平衡的木桥', thumbnail: 'https://placehold.co/160x90/FFC0CB/FFFFFF?text=感统2' },
            { id: 7, title: '触觉的魔法盒', thumbnail: 'https://placehold.co/160x90/FFC0CB/FFFFFF?text=感统3' },
        ],
        '家长课堂': [
            { id: 8, title: '如何与孩子沟通', thumbnail: 'https://placehold.co/160x90/D3D3D3/FFFFFF?text=家长1' },
            { id: 9, title: '建立积极的规则', thumbnail: 'https://placehold.co/160x90/D3D3D3/FFFFFF?text=家长2' },
        ],
    };
    
    // 训练模块数据
    const trainingData = [
        {
            category: '专注力',
            games: [ { name: '舒尔特方格', screen: 'SchulteDifficulty' }, { name: '连线训练图卡', screen: 'ComingSoon' }, { name: '视觉追踪', screen: 'ComingSoon' }, { name: '色彩方格', screen: 'ColorGridGame' } ]
        },
        {
            category: '记忆力',
            games: [ { name: '记忆挑战', screen: 'ComingSoon' }, { name: '拼图游戏', screen: 'ComingSoon' }, { name: '瞬间观察', screen: 'ComingSoon' }, { name: '魔方墙', screen: 'ComingSoon' } ]
        },
        {
            category: '逻辑力',
            games: [ { name: '谜题解密', screen: 'ComingSoon' }, { name: '走迷宫', screen: 'ComingSoon' }, { name: '找错误', screen: 'ComingSoon' }, { name: '华容道', screen: 'ComingSoon' }, { name: '逆向推算', screen: 'ComingSoon' } ]
        },
        {
            category: '反应力',
            games: [ { name: '色彩识别', screen: 'ComingSoon' }, { name: '颜色分类', screen: 'ComingSoon' }, { name: '顺次连数', screen: 'ComingSoon' }, { name: '眼疾手快', screen: 'ComingSoon' }, { name: '快速比较', screen: 'ComingSoon' } ]
        },
        {
            category: '想象力',
            games: [ { name: '色彩涂鸦', screen: 'ComingSoon' }, { name: '数一数', screen: 'ComingSoon' }, { name: '空间训练', screen: 'ComingSoon' }, { name: '逆向推算', screen: 'ComingSoon' } ]
        },
        {
            category: '观察力',
            games: [ { name: '找不同', screen: 'ComingSoon' }, { name: '配对游戏', screen: 'ComingSoon' }, { name: '圈一圈', screen: 'ComingSoon' } ]
        }
    ];

    // 测评状态
    const [assessmentInfo, setAssessmentInfo] = useState({ name: '', age: '', gender: null });
    const [assessmentStep, setAssessmentStep] = useState(0); // 0: not started, 1-10: questions
    const [selectedOption, setSelectedOption] = useState(null);
    const [scores, setScores] = useState([]);
    
    const assessmentQuestions = [
        { q: '做作业时，您的孩子是否难以保持注意力，容易被别的东西吸引？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '和别人讲话时，您的孩子是否常常打断别人，或者不等别人说完就抢着回答？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '在需要安静的场合（如上课、图书馆），您的孩子是否难以保持安静，总是动来动去？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '您的孩子是否经常忘记带学习用品或日常用品？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '在做游戏或排队时，您的孩子是否很难耐心等待？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '当您给孩子下达一连串的指令时（如“先洗手，然后把玩具放好”），他是否很难全部完成？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '您的孩子是否话特别多，说起来就停不下来？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '您的孩子是否会做一些有危险性的事情，不考虑后果？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '在完成一项任务时（如拼图、画画），您的孩子是否容易半途而废？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
        { q: '您的孩子是否经常情绪波动大，容易因为小事发脾气或哭闹？', options: {'A': '经常这样', 'B': '有时候', 'C': '很少或从不'}},
    ];

    const handleAssessmentInfoChange = (field, value) => {
        setAssessmentInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleNextQuestion = () => {
        if (!selectedOption) return;

        const scoreMap = { 'A': 1, 'B': 2, 'C': 3 };
        const newScore = scoreMap[selectedOption];
        setScores(prevScores => [...prevScores, newScore]);
        setSelectedOption(null);

        if (assessmentStep < assessmentQuestions.length) {
            setAssessmentStep(prevStep => prevStep + 1);
        } else {
            navigate('AssessmentResultPrompt');
        }
    };
    
    // AI 聊天状态
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isStoryPromptVisible, setIsStoryPromptVisible] = useState(false);
    const [storyTopic, setStoryTopic] = useState('');
    const chatHistory = useRef([]);
    const chatEndRef = useRef(null);
    
    useEffect(() => {
        // Load Recharts library dynamically
        if (!window.Recharts) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/recharts/umd/Recharts.min.js';
            script.onload = () => {
                setRechartsLoaded(true);
                console.log('Recharts loaded!');
            };
            document.head.appendChild(script);
        } else {
            setRechartsLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (currentScreen === 'AIChat' && messages.length === 0) {
             const welcomeMessage = {id: 1, text: '你好呀～小朋友！有什么想和我聊的吗？或者想让我给你讲个故事吗？', sender: 'ai'};
            setMessages([welcomeMessage]);
             chatHistory.current.push({ role: 'model', parts: [{ text: welcomeMessage.text }] });
        }
    }, [currentScreen]);

    useEffect(() => {
        // 消息列表自动滚动到底部
        if(chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // --- Gemini API Function ---
    const callGeminiAPI = async (prompt) => {
        setIsAiTyping(true);
        try {
            const historyForAPI = [...chatHistory.current, { role: 'user', parts: [{ text: prompt }] }];
            const payload = { contents: historyForAPI };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            
            let aiText = "抱歉，我好像有点走神了，你能再说一遍吗？";
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts.length > 0) {
                 aiText = result.candidates[0].content.parts[0].text;
            } else {
                 console.warn("Unexpected API response structure:", result);
            }
             
             chatHistory.current.push({ role: 'user', parts: [{ text: prompt }] });
             chatHistory.current.push({ role: 'model', parts: [{ text: aiText }] });
             return aiText;

        } catch (error) {
            console.error("Gemini API call failed:", error);
            return "哎呀，我的网络好像出问题了，等会再聊吧！";
        } finally {
            setIsAiTyping(false);
        }
    };
    
    const handleSendMessage = async () => {
        if (inputText.trim() === '') return;
        const userMessageText = inputText;
        const userMessage = { id: Date.now(), text: userMessageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');

        const aiText = await callGeminiAPI(userMessageText);
        const aiMessage = { id: Date.now() + 1, text: aiText, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
    };

    const handleGenerateStory = async () => {
        if (storyTopic.trim() === '') return;
        const topic = storyTopic;
        setStoryTopic('');
        setIsStoryPromptVisible(false);

        const storyRequestMessage = { id: Date.now(), text: `给我讲一个关于"${topic}"的故事吧！`, sender: 'user' };
        setMessages(prev => [...prev, storyRequestMessage]);

        const prompt = `你是一个富有想象力、会讲故事的AI伙伴。请为一位5岁的小朋友讲一个关于“${topic}”的简短、温馨、有趣的小故事。故事的主角应该是孩子的AI伙伴（比如一个小精灵或者小机器人）。故事要充满想象力，并且有一个积极、温暖的结尾。`;
        const aiStory = await callGeminiAPI(prompt);
        const aiMessage = { id: Date.now() + 1, text: aiStory, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
    };

    // 报告页 AI 解读
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

    const generateAiAnalysis = async () => {
        setIsGeneratingAnalysis(true);
        setAiAnalysis('');
        
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const prompt = `
            你是一位专业的儿童心理和教育专家。请根据以下儿童注意力测评数据，生成一份通俗易懂、充满鼓励的分析报告和家庭训练建议。
            面向对象是孩子的家长。语言要温暖、积极，避免使用过于专业或负面的词汇。
            
            儿童信息:
            - 昵称: ${assessmentInfo.name || '宝贝'}
            - 年龄: ${assessmentInfo.age || '未填写'}
            - 性别: ${assessmentInfo.gender || '未填写'}

            测评总分: ${totalScore} (满分 ${assessmentQuestions.length * 3})

            详细得分 (1分表示'经常这样', 3分表示'很少或从不'):
            ${assessmentQuestions.map((q, i) => `- ${q.q}: ${scores[i] || '未答'}分`).join('\n')}

            请根据以上数据，生成一份包含【综合分析】和【训练建议】两部分的报告。在建议部分，请结合app中已有的游戏（如舒尔特方格、色彩方格）提出具体建议。
        `;

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            let analysisText = "分析报告生成失败，请稍后再试。";
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts.length > 0) {
                 analysisText = result.candidates[0].content.parts[0].text;
            }
            setAiAnalysis(analysisText);
        } catch(error) {
            console.error("AI Analysis generation failed:", error);
            setAiAnalysis("哎呀，网络开小差了，无法生成AI分析报告，请检查网络后重试。");
        } finally {
            setIsGeneratingAnalysis(false);
        }
    };


    const handleSendVoiceMessage = () => {
        const newUserMessage = {
            id: Date.now(),
            text: '[语音消息] 我想和你玩游戏！',
            sender: 'user',
        };
        setMessages(prev => [...prev, newUserMessage]);

        // 模拟AI回复
        setTimeout(() => {
            const newAiMessage = {
                id: Date.now() + 1,
                text: '我听到你说话啦！你想玩什么游戏呢？',
                sender: 'ai',
            };
            setMessages(prev => [...prev, newAiMessage]);
        }, 1000);
    };

    const navigate = (screen, data) => {
        if (screen === 'VideoPlayer') {
            setCurrentVideo(data);
        }
        setHistory(prevHistory => [...prevHistory, screen]);
        setCurrentScreen(screen);
    };

    const goBack = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            const prevScreen = newHistory[newHistory.length - 1];
            
            setHistory(newHistory);
            setCurrentScreen(prevScreen);
        } else {
            setCurrentScreen('Home');
            setActiveTab('首页');
        }
    };

    useEffect(() => {
        const mainScreenTabs = {
            Home: '首页',
            Courses: '课程',
            Training: '训练',
            My: '我的',
        };
        const tabForCurrentScreen = mainScreenTabs[currentScreen];
        if (tabForCurrentScreen && activeTab !== tabForCurrentScreen) {
            setActiveTab(tabForCurrentScreen);
        }
    }, [currentScreen]);

    const partners = [
        { name: '小精灵', img: 'https://placehold.co/150x150/f2c94c/000?text=精灵' },
        { name: '小机器人', img: 'https://placehold.co/150x150/76D7C4/000?text=机器人' },
        { name: '小恐龙', img: 'https://placehold.co/150x150/F5B7B1/000?text=恐龙' },
    ];
    
    const completeOnboarding = (startAssessment = false) => {
        setUser(prevUser => ({
            ...prevUser,
            name: tempUser.name || '小探险家',
            age: tempUser.age,
            gender: tempUser.gender,
            avatar: tempUser.avatar || partners[0].img, // 默认第一个伙伴
        }));
        setIsLoggedIn(true);
        setIsFirstLaunch(false);
        if (startAssessment) {
            navigate('AssessmentInfo');
        } else {
            setActiveTab('首页');
            setCurrentScreen('Home');
        }
    };

    const handleTabChange = (tab) => {
        const screenMap = {
            '首页': 'Home',
            '课程': 'Courses',
            '训练': 'Training',
            '我的': 'My'
        };
        const targetScreen = screenMap[tab];
        if (targetScreen) {
            setActiveTab(tab);
            setCurrentScreen(targetScreen);
            setHistory([targetScreen]);
        }
    };
    
    // Aggregate all props for ScreenRenderer
    const screenRendererProps = {
        currentScreen,
        activeTab,
        isFirstLaunch,
        onboardingStep,
        setOnboardingStep,
        user,
        tempUser,
        setTempUser,
        completeOnboarding,
        partners,
        navigate,
        goBack,
        schulteDifficulty,
        setSchulteDifficulty,
        setIsRulesModalVisible,
        gameResult,
        setGameResult,
        setHistory,
        setCurrentScreen,
        setActiveTab,
        todayTrainingData,
        assessmentInfo,
        handleAssessmentInfoChange,
        setScores,
        assessmentStep,
        setAssessmentStep,
        assessmentQuestions,
        selectedOption,
        setSelectedOption,
        handleNextQuestion,
        isLoggedIn,
        setIsLoggedIn,
        rechartsLoaded,
        scores,
        aiAnalysis,
        isGeneratingAnalysis,
        generateAiAnalysis,
        messages,
        isAiTyping,
        chatEndRef,
        isStoryPromptVisible,
        setIsStoryPromptVisible,
        storyTopic,
        setStoryTopic,
        handleGenerateStory,
        inputText,
        setInputText,
        handleSendMessage,
        handleSendVoiceMessage,
        activeCourseTab,
        setActiveCourseTab,
        courseData,
        currentVideo,
        trainingData,
        setUser,
        isShareModalVisible,
        setIsShareModalVisible,
        babies,
        setBabies,
        newBaby,
        setNewBaby,
        feedbackText,
        setFeedbackText,
        soundEnabled,
        setSoundEnabled,
        vibrationEnabled,
        setVibrationEnabled,
    };
    
    return (
        <div style={styles.phoneWrapper}>
            <div style={styles.container}>
                {isRulesModalVisible && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalContent}>
                            <h2 style={styles.modalTitle}>游戏规则</h2>
                            <p style={styles.modalText}>
                                请在 {schulteDifficulty}x{schulteDifficulty} 的方格中，尽快从 1 按顺序依次点击到 {schulteDifficulty * schulteDifficulty}。
                            </p>
                            <button style={styles.primaryButton} onClick={() => { setIsRulesModalVisible(false); navigate('SchulteGame'); }}>
                                <span style={styles.primaryButtonText}>开始挑战</span>
                            </button>
                        </div>
                    </div>
                )}
                
                <main style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <ScreenRenderer {...screenRendererProps} />
                </main>
                
                <BottomTabBar 
                    activeTab={activeTab}
                    currentScreen={currentScreen}
                    setActiveTab={handleTabChange} 
                    onPlusPress={() => navigate('AIChat')} 
                />
                 <ShareModal isVisible={isShareModalVisible} onClose={() => setIsShareModalVisible(false)} />
            </div>
        </div>
    );
};


// --- 样式表 (Web版本) ---
const styles = {
    phoneWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to right, #ece9e6, #ffffff)',
    },
    container: { 
        width: '375px',
        height: '812px',
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#FFF', 
        fontFamily: 'sans-serif', 
        position: 'relative',
        overflow: 'hidden',
        border: '8px solid #333',
        borderRadius: '40px',
        boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
    },
    page: { flex: 1, padding: '15px', backgroundColor: '#F8F9FA', boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column' },
    centeredPage: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '15px', backgroundColor: '#F8F9FA', boxSizing: 'border-box', height: '100%' },
    headerTitle: { fontSize: '22px', fontWeight: 'bold', color: '#333', marginBottom: '20px', textAlign: 'center' },
    sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#444', marginTop: '20px', marginBottom: '10px', paddingLeft: '15px' },
    backButton: { position: 'absolute', top: '15px', left: '15px', padding: '8px 12px', zIndex: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid #CCC', borderRadius: '8px', cursor: 'pointer' },
    icon: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    
    tabBarContainer: { display: 'flex', flexDirection: 'row', height: '60px', borderTop: '1px solid #EEE', backgroundColor: 'rgba(255, 255, 255, 0.9)', position: 'relative', marginTop: 'auto' },
    tabItem: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' },
    tabLabel: { fontSize: '10px', marginTop: '2px' },
    plusButton: { position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', width: '50px', height: '50px', borderRadius: '25px', backgroundColor: '#4A90E2', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.25)', cursor: 'pointer' },
    plusButtonText: { color: '#FFF', fontSize: '30px', lineHeight: '34px' },

    homeHeader: { display: 'flex', justifyContent: 'space-between', padding: '0 5px', marginBottom: '15px' },
    headerButton: { display: 'flex', alignItems: 'center', backgroundColor: '#EFEFEF', padding: '6px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer' },
    aiCompanionContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' },
    aiBubble: { backgroundColor: 'rgba(74, 144, 226, 0.2)', padding: '8px 12px', borderRadius: '15px', position: 'absolute', top: '-10px', left: '20px', zIndex: 1},
    aiBubbleText: { fontSize: '14px', color: '#4A90E2', margin: 0 },
    aiDoll: { width: '340px', height: '340px', borderRadius: '170px' },
    sideButtonsContainer: { position: 'absolute', top: '100px', right: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
    sideButton: { padding: '8px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', border:'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    bottomEntrances: { display: 'flex', justifyContent: 'space-around', marginTop: '20px' },
    entranceCard: { width: '130px', height: '130px', backgroundColor: '#FFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', paddingTop: '10px', boxSizing: 'border-box' },
    entranceText: { fontSize: '14px', fontWeight: 'bold', marginTop: '8px' },
    
    courseTabContainer: { display: 'flex', marginBottom: '15px', borderBottom: '1px solid #eee' },
    courseTab: { flex: 1, padding: '10px', background: 'none', border: 'none', fontSize: '14px', color: '#888', cursor: 'pointer', borderBottom: '2px solid transparent' },
    courseTabActive: { flex: 1, padding: '10px', background: 'none', border: 'none', fontSize: '14px', color: '#4A90E2', cursor: 'pointer', borderBottom: '2px solid #4A90E2', fontWeight: 'bold' },
    grid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px' },
    videoItemButton: { width: 'calc(50% - 5px)', background: '#fff', border: 'none', padding: 0, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' },
    videoThumbnail: { width: '100%', height: '90px', objectFit: 'cover' },
    videoTitle: { fontSize: '14px', padding: '8px', margin: 0, textAlign: 'left', color: '#333' },

    banner: { width: '100%', height: 'auto', borderRadius: '15px', marginBottom: '20px', objectFit: 'cover' },
    trainingSection: { marginBottom: '20px' },
    gameGrid: { display: 'flex', flexWrap: 'wrap', gap: '15px' },
    gameIcon: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'calc(25% - 12px)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'center' },
    gameIconLabel: {fontSize: '12px', marginTop: '5px', color: '#333'},

    profileHeader: { display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#FFF', borderRadius: '15px', marginBottom: '15px', cursor: 'pointer' },
    avatar: { width: '60px', height: '60px', borderRadius: '30px', marginRight: '15px' },
    profileName: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
    profileId: { fontSize: '12px', color: '#888', margin: 0 },
    shareBanner: { backgroundColor: '#FFDAB9', padding: '15px', borderRadius: '15px', textAlign: 'center', marginBottom: '15px', border: 'none', width: '100%', cursor: 'pointer' },
    shareBannerText: { color: '#D2691E', fontWeight: 'bold' },
    myQuickLinks: { display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#FFF', borderRadius: '15px', marginBottom: '15px' },
    quickLinkItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' },
    menuList: { backgroundColor: '#FFF', borderRadius: '15px' },
    menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: 'none', borderBottom: '1px solid #F0F0F0', width: '100%', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px' },
    
    trainingList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    trainingListItem: { display: 'flex', alignItems: 'center', backgroundColor: '#FFF', padding: '15px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'},
    trainingListItemButton: { display: 'flex', alignItems: 'center', backgroundColor: '#FFF', padding: '15px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' },
    trainingListItemText: { fontSize: '16px', fontWeight: '500', marginLeft: '15px', flex: 1 },
    starContainer: { display: 'flex', flexDirection: 'row' },
    star: { fontSize: '20px', marginRight: '2px' },

    difficultyGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' },
    difficultyButton: { width: '80px', height: '80px', backgroundColor: '#4A90E2', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '15px', border: 'none', cursor: 'pointer' },
    difficultyButtonText: { color: '#FFF', fontSize: '18px', fontWeight: 'bold' },
    gameContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    gameStats: { display: 'flex', justifyContent: 'space-around', width: '100%', marginBottom: '20px' },
    gameStatText: { fontSize: '16px', fontWeight: '500' },
    schulteGrid: { display: 'grid', gap: '5px' },
    gridCell: { backgroundColor: '#FFF', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', border: '1px solid #DDD', cursor: 'pointer', transition: 'background-color 0.2s, border-color 0.2s' },
    gridCellCleared: { backgroundColor: '#E8F0F2', borderColor: '#AEC6CF' },
    gridCellWrong: { backgroundColor: '#FFCDD2', borderColor: '#E57373' },
    gridNumber: { fontSize: '20px', transition: 'color 0.2s' },
    
    resultBox: { margin: '20px 0', textAlign: 'center', background: '#fff', padding: '15px', borderRadius: '12px' },
    resultText: { fontSize: '18px', margin: '5px 0', fontWeight: 'bold', color: '#333' },
    buttonRow: { display: 'flex', gap: '20px' },

    input: { border: '1px solid #DDD', padding: '12px', borderRadius: '10px', marginBottom: '15px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
    inputLabel: {fontSize: '14px', color: '#333', marginBottom: '8px'},
    genderSelector: {display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'},
    genderButton: {padding: '10px 20px', border: '1px solid #DDD', borderRadius: '20px', background: '#FFF', cursor: 'pointer'},
    genderButtonSelected: {padding: '10px 20px', border: '1px solid #4A90E2', borderRadius: '20px', background: '#E8F0F2', cursor: 'pointer', color: '#4A90E2'},
    progressBar: { height: '8px', width: '100%', backgroundColor: '#E0E0E0', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' },
    questionText: { fontSize: '16px', marginBottom: '20px', lineHeight: 1.4, textAlign: 'left' },
    optionButton: { backgroundColor: '#FFF', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #EEE', width: '100%', textAlign: 'left', cursor: 'pointer' },
    optionButtonSelected: { backgroundColor: '#E8F0F2', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #4A90E2', width: '100%', textAlign: 'left', cursor: 'pointer' },
    optionText: { margin: 0, fontSize: '14px', lineHeight: 1.5 },
    
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { width: '80%', maxWidth: '300px', backgroundColor: 'white', borderRadius: '20px', padding: '20px', alignItems: 'center', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    modalTitle: { fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' },
    modalText: { fontSize: '14px', textAlign: 'center', marginBottom: '25px', lineHeight: 1.5 },
    
    primaryButton: { backgroundColor: '#4A90E2', padding: '12px 25px', borderRadius: '25px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    primaryButtonDisabled: { backgroundColor: '#B0C4DE', padding: '12px 25px', borderRadius: '25px', border: 'none', cursor: 'not-allowed' },
    primaryButtonText: { color: '#FFF', fontSize: '14px', fontWeight: 'bold' },
    secondaryButton: { backgroundColor: '#FFF', padding: '12px 25px', borderRadius: '25px', border: '1px solid #4A90E2', cursor: 'pointer' },
    secondaryButtonText: { color: '#4A90E2', fontSize: '14px', fontWeight: 'bold' },

    calendarContainer: { padding: '10px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    calendarHeader: { textAlign: 'center', marginBottom: '15px' },
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' },
    calendarDay: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px', borderRadius: '50%', position: 'relative'},
    calendarDayEmpty: { height: '40px' },
    calendarDayToday: { backgroundColor: '#FFDAB9', color: '#000', fontWeight: 'bold' },
    calendarDayCheckedIn: { backgroundColor: '#4A90E2', color: '#fff' },
    calendarWeekDay: { textAlign: 'center', fontWeight: 'bold', color: '#888', paddingBottom: '10px' },
    checkMark: { position: 'absolute', bottom: '2px', right: '2px', fontSize: '10px', color: 'lightgreen' },

    membershipContainer: { display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' },
    membershipCard: { width: '90%', padding: '20px', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #eee', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'relative'},
    membershipCardRecommended: { borderColor: '#FFD700', borderWidth: '2px'},
    recommendedBadge: { position: 'absolute', top: '-15px', right: '15px', backgroundColor: '#FFD700', color: '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'},
    membershipTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 10px 0' },
    membershipPrice: { fontSize: '24px', fontWeight: 'bold', color: '#4A90E2', margin: '0 0 10px 0' },
    membershipDesc: { fontSize: '14px', color: '#888', marginBottom: '20px' },
    
    // AI 聊天样式
    chatContainer: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F0F4F8' },
    chatHeader: { backgroundColor: '#FFF', padding: '10px 15px', borderBottom: '1px solid #EEE', textAlign: 'center', position: 'relative' },
    chatHeaderTitle: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
    backButtonChat: { position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 10px' },
    messageList: { flex: 1, overflowY: 'auto', padding: '15px' },
    aiMessageContainer: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px', gap: '8px', alignItems: 'flex-end' },
    userMessageContainer: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
    aiMessageBubble: { backgroundColor: '#FFF', padding: '10px 15px', borderRadius: '20px', borderBottomLeftRadius: '5px', maxWidth: '70%' },
    userMessageBubble: { backgroundColor: '#4A90E2', color: '#FFF', padding: '10px 15px', borderRadius: '20px', borderBottomRightRadius: '5px', maxWidth: '70%' },
    messageText: { margin: 0, fontSize: '15px', lineHeight: '1.4' },
    chatInputContainer: { display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#FFF', borderTop: '1px solid #EEE' },
    voiceButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 10px', color: '#555' },
    chatInput: { flex: 1, border: '1px solid #DDD', borderRadius: '20px', padding: '10px 15px', fontSize: '15px' },
    sendButton: { background: '#4A90E2', color: '#FFF', border: 'none', borderRadius: '20px', padding: '10px 15px', marginLeft: '10px', cursor: 'pointer' },
    storyButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 10px', color: '#FFD700' },
    typingIndicator: { fontStyle: 'italic', color: '#888', marginLeft: '40px' },

    // 报告页图表样式
    chartContainer: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        marginBottom: '20px',
    },
    aiAnalysisContainer: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        marginBottom: '20px',
    },
    aiText: {
        fontSize: '14px',
        lineHeight: 1.7,
        color: '#555',
        whiteSpace: 'pre-wrap',
    },
    
    // 我的 -> 设置项
    settingItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0'
    },
    babyItem: {
         display: 'flex',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0'
    },
    switchOn: {
        width: 50, height: 30, borderRadius: 15, backgroundColor: '#4CD964', position: 'relative', cursor: 'pointer', border: 'none'
    },
    switchOff: {
        width: 50, height: 30, borderRadius: 15, backgroundColor: '#E5E5EA', position: 'relative', cursor: 'pointer', border: 'none'
    },
    switchHandleOn: {
        width: 26, height: 26, borderRadius: 13, backgroundColor: 'white', position: 'absolute', top: 2, left: 22, transition: 'left 0.2s'
    },
    switchHandleOff: {
        width: 26, height: 26, borderRadius: 13, backgroundColor: 'white', position: 'absolute', top: 2, left: 2, transition: 'left 0.2s'
    },
    // 分享
    shareSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F8F9FA',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        padding: '20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 1001,
    },
    shareTitle: {
        textAlign: 'center',
        fontSize: '16px',
        color: '#333',
        marginBottom: '20px',
    },
    shareGrid: {
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '20px',
    },
    shareItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    shareLabel: {
        fontSize: '12px',
        marginTop: '5px',
        color: '#555',
    },
    cancelButton: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        cursor: 'pointer',
    },
    stickerItem: {
        width: 'calc(25% - 8px)',
        aspectRatio: '1',
        backgroundColor: '#fff',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    feedbackInput: {
        width: '100%',
        height: '150px',
        border: '1px solid #DDD',
        borderRadius: '10px',
        padding: '10px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginBottom: '5px',
    },
     // 新手引导
    onboardingWelcome: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '15px',
        boxSizing: 'border-box',
        height: '100%',
        background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    },
    permissionItem: {
        width: '80%',
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '12px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    partnerSelectionGrid: {
        display: 'flex',
        justifyContent: 'space-around',
        gap: '15px',
        marginBottom: '30px',
    },
    partnerCard: {
        padding: '10px',
        borderRadius: '20px',
        border: '2px solid transparent',
        cursor: 'pointer',
    },
    partnerCardSelected: {
        padding: '10px',
        borderRadius: '20px',
        border: '2px solid #4A90E2',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(74, 144, 226, 0.4)',
    },
};

export default App;
