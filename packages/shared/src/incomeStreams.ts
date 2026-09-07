import { IncomeStream } from '@personal-finance/types';

export function calculateIncomeSummary(streams: IncomeStream[], primarySalary: number) {
  const freelanceStreams = streams.filter((s) => s.type !== 'SALARY_JOB');
  const totalFreelanceExpected = freelanceStreams.reduce((sum, s) => sum + s.expectedAmount, 0);
  const totalInflow = primarySalary + totalFreelanceExpected;

  return {
    primarySalary,
    totalFreelanceExpected,
    totalInflow,
    streamsCount: streams.length + (primarySalary > 0 ? 1 : 0),
    freelanceSharePercent: totalInflow > 0 ? (totalFreelanceExpected / totalInflow) * 100 : 0,
  };
}
