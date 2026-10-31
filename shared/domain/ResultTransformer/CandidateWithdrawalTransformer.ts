import { injectable } from "tsyringe";
import { ABSTAIN_KEY, CandidateListData } from "../../types";

@injectable()
export class CandidateWithdrawalTransformer {
  redistribute(
    districts: CandidateListData[],
    candidateId: string,
    redistribution: Record<string, number>,
  ): CandidateListData[] {
    const targets = Object.keys(redistribution).sort();

    return districts.map((district) => {
      const votes = district.partok[candidateId] ?? 0;
      const partok = { ...district.partok, [candidateId]: 0 };
      if (votes <= 0) {
        return { ...district, partok };
      }

      this.allocate(votes, targets, redistribution).forEach((amount, i) => {
        const target = targets[i];
        if (target !== ABSTAIN_KEY && amount > 0) {
          partok[target] = (partok[target] ?? 0) + amount;
        }
      });

      return { ...district, partok };
    });
  }

  private allocate(
    votes: number,
    targets: string[],
    redistribution: Record<string, number>,
  ): number[] {
    const exact = targets.map((t) => votes * redistribution[t]);
    const amounts = exact.map(Math.floor);
    let remaining = votes - amounts.reduce((sum, v) => sum + v, 0);

    const byRemainder = targets
      .map((_, i) => i)
      .sort((a, b) => exact[b] - amounts[b] - (exact[a] - amounts[a]) || a - b);

    for (const i of byRemainder) {
      if (remaining <= 0) {
        break;
      }
      amounts[i] += 1;
      remaining -= 1;
    }

    return amounts;
  }
}
