import * as db from "./db";

/**
 * Email Report Generation Service
 * Generates weekly and monthly progress reports for users
 */

interface ReportData {
  userName: string;
  userEmail: string;
  period: "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  stats: {
    totalSessions: number;
    totalMinutes: number;
    averageScore: number;
    pronunciationScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    grammarScore: number;
    wordsLearned: number;
    streak: number;
  };
  topWords: Array<{
    word: string;
    attempts: number;
    successRate: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    unlockedAt: Date;
  }>;
  recommendations: string[];
}

/**
 * Generate weekly progress report for a user
 */
export async function generateWeeklyReport(userId: number): Promise<ReportData | null> {
  try {
    // Get user info
    const user = await db.getUserById(userId);
    if (!user || !user.email) {
      console.log(`[Email Reports] User ${userId} has no email`);
      return null;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    // Get practice sessions from last 7 days
    const sessions = await db.getUserPracticeSessionsInRange(userId, startDate, endDate);
    
    if (sessions.length === 0) {
      console.log(`[Email Reports] User ${userId} has no activity in the past week`);
      return null;
    }

    // Calculate stats
    const totalSessions = sessions.length;
    const totalMinutes = Math.round(
      sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    );
    const averageScore = Math.round(
      sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions
    );

    // Get user progress
    const progress = await db.getUserProgress(userId);

    // Get vocabulary progress
    const vocabProgress = await db.getUserVocabularyProgressInRange(userId, startDate, endDate);
    const wordsLearned = vocabProgress.length;

    // Get top practiced words
    const topWords = vocabProgress
      .sort((a: any, b: any) => (b.attempts || 0) - (a.attempts || 0))
      .slice(0, 5)
      .map((v: any) => ({
        word: v.wordId,
        attempts: v.attempts || 0,
        successRate: v.attempts ? Math.round(((v.successCount || 0) / v.attempts) * 100) : 0,
      }));

    // Get recent achievements
    const achievements = await db.getUserAchievementsInRange(userId, startDate, endDate) as any[];

    // Generate personalized recommendations
    const recommendations = generateRecommendations({
      averageScore,
      totalSessions,
      pronunciationScore: progress?.pronunciationScore || 0,
      fluencyScore: progress?.fluencyScore || 0,
      vocabularyScore: progress?.vocabularyScore || 0,
    });

    return {
      userName: user.name || "Student",
      userEmail: user.email,
      period: "weekly",
      startDate,
      endDate,
      stats: {
        totalSessions,
        totalMinutes,
        averageScore,
        pronunciationScore: progress?.pronunciationScore || 0,
        fluencyScore: progress?.fluencyScore || 0,
        vocabularyScore: progress?.vocabularyScore || 0,
        grammarScore: progress?.grammarScore || 0,
        wordsLearned,
        streak: 0, // TODO: Calculate streak
      },
      topWords,
      achievements: achievements.map((a: any) => ({
        id: a.achievementId,
        title: a.achievementId, // TODO: Map to achievement title
        unlockedAt: a.unlockedAt,
      })),
      recommendations,
    };
  } catch (error) {
    console.error(`[Email Reports] Error generating weekly report for user ${userId}:`, error);
    return null;
  }
}

/**
 * Generate monthly progress report for a user
 */
export async function generateMonthlyReport(userId: number): Promise<ReportData | null> {
  // Similar to weekly but with 30-day range
  // Implementation follows same pattern as generateWeeklyReport
  return null; // TODO: Implement
}

/**
 * Generate personalized recommendations based on user performance
 */
function generateRecommendations(stats: {
  averageScore: number;
  totalSessions: number;
  pronunciationScore: number;
  fluencyScore: number;
  vocabularyScore: number;
}): string[] {
  const recommendations: string[] = [];

  if (stats.totalSessions < 3) {
    recommendations.push("Try to practice at least 3 times per week for consistent improvement.");
  }

  if (stats.pronunciationScore < 70) {
    recommendations.push("Focus on pronunciation practice. Listen to native speakers and repeat slowly.");
  }

  if (stats.fluencyScore < 70) {
    recommendations.push("Work on speaking fluency. Try speaking full sentences without pausing.");
  }

  if (stats.vocabularyScore < 70) {
    recommendations.push("Expand your vocabulary. Practice with the intermediate and advanced word lists.");
  }

  if (stats.averageScore >= 80) {
    recommendations.push("Great job! Consider challenging yourself with advanced vocabulary.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Keep up the good work! Consistency is key to language learning success.");
  }

  return recommendations;
}

/**
 * Generate HTML email template for progress report
 */
export function generateReportHTML(data: ReportData): string {
  const periodText = data.period === "weekly" ? "Weekly" : "Monthly";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${periodText} Progress Report - Talky Talky</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #6366f1;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 25px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }
    .word-item {
      background: #f8f9fa;
      padding: 10px 15px;
      margin-bottom: 8px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .recommendation {
      background: #eff6ff;
      border-left: 3px solid #6366f1;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .achievement {
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: #6366f1;
      color: white;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎤 Talky Talky</div>
      <div class="subtitle">${periodText} Progress Report</div>
      <div class="subtitle">${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}</div>
    </div>

    <h2>Hi ${data.userName}! 👋</h2>
    <p>Here's your ${data.period} progress summary. Keep up the great work!</p>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats.totalSessions}</div>
        <div class="stat-label">Practice Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.totalMinutes}m</div>
        <div class="stat-label">Total Minutes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.averageScore}%</div>
        <div class="stat-label">Average Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.wordsLearned}</div>
        <div class="stat-label">Words Learned</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📊 Skill Breakdown</div>
      <div class="word-item">
        <span>Pronunciation</span>
        <strong>${data.stats.pronunciationScore}%</strong>
      </div>
      <div class="word-item">
        <span>Fluency</span>
        <strong>${data.stats.fluencyScore}%</strong>
      </div>
      <div class="word-item">
        <span>Vocabulary</span>
        <strong>${data.stats.vocabularyScore}%</strong>
      </div>
      <div class="word-item">
        <span>Grammar</span>
        <strong>${data.stats.grammarScore}%</strong>
      </div>
    </div>

    ${data.topWords.length > 0 ? `
    <div class="section">
      <div class="section-title">🎯 Top Practiced Words</div>
      ${data.topWords.map(w => `
        <div class="word-item">
          <span><strong>${w.word}</strong> (${w.attempts} attempts)</span>
          <span>${w.successRate}% success</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${data.achievements.length > 0 ? `
    <div class="section">
      <div class="section-title">🏆 New Achievements</div>
      ${data.achievements.map(a => `
        <div class="achievement">
          <strong>${a.title}</strong>
          <div style="font-size: 12px; color: #666;">Unlocked on ${a.unlockedAt.toLocaleDateString()}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">💡 Recommendations</div>
      ${data.recommendations.map(r => `
        <div class="recommendation">${r}</div>
      `).join('')}
    </div>

    <div style="text-align: center;">
      <a href="https://talkytalky.app" class="cta-button">Continue Practicing →</a>
    </div>

    <div class="footer">
      <p>You're receiving this email because you have email reports enabled in your Talky Talky account.</p>
      <p><a href="https://talkytalky.app/profile">Manage email preferences</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send email report (placeholder - requires email service configuration)
 */
export async function sendEmailReport(data: ReportData): Promise<boolean> {
  const html = generateReportHTML(data);
  
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  // For now, just log that we would send the email
  console.log(`[Email Reports] Would send ${data.period} report to ${data.userEmail}`);
  console.log(`[Email Reports] Subject: Your ${data.period} progress report from Talky Talky`);
  
  // In production, use an email service:
  // await emailService.send({
  //   to: data.userEmail,
  //   subject: `Your ${data.period} progress report from Talky Talky`,
  //   html,
  // });
  
  return true;
}
