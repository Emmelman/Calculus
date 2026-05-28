import { achievementById } from "../store/achievements";
import { AnswerResult } from "../store/types";
import { celebrate, useToast } from "./fx";
import { playCorrect, playWin, playWrong } from "./sound";

/**
 * Turn an answer result into sound + toast + confetti feedback. Priority:
 * level-up > new achievement > streak milestone > plain coin gain.
 */
export function reward(result: AnswerResult): void {
  const toast = useToast.getState();

  if (!result.correct) {
    playWrong();
    return;
  }

  playCorrect();

  if (result.leveledUp) {
    playWin();
    celebrate("big");
    toast.show(`🎉 Уровень ${result.level}!`);
    return;
  }

  if (result.unlocked.length > 0) {
    const ach = achievementById(result.unlocked[0]);
    celebrate("big");
    toast.show(`${ach?.emoji ?? "🏆"} ${ach?.title ?? "Достижение!"}`);
    return;
  }

  if (result.streak > 0 && result.streak % 5 === 0) {
    celebrate("small");
    toast.show(`🔥 Серия ${result.streak}!`);
    return;
  }

  toast.show(`+${result.coinsEarned} 🪙`);
}
